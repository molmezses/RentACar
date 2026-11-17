
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import request from 'supertest';

import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { EMAIL_SENDER } from '../src/invitation-delivery/email-sender.token.js';
import type {
  EmailSender,
  SendInvitationEmail,
} from '../src/invitation-delivery/email-sender.interface.js';
import { InvitationDeliveryScheduler } from '../src/invitation-delivery/invitation-delivery.scheduler.js';
import { InvitationDeliveryWorker } from '../src/invitation-delivery/invitation-delivery.worker.js';
import { InvitationDeliveryRepository } from '../src/invitation-delivery/invitation-delivery.repository.js';

describe('Tenant Onboarding E2E', () => {
  let app: INestApplication | undefined;
  let prisma: PrismaService;
  let platformAdminId: string | undefined;
  let databaseVerified = false;

  const suffix = randomUUID();
  const slug = `e2e-onboarding-${suffix}`;
  const email = `e2e-onboarding-${suffix}@example.test`;
  const password = 'SecurePassword123!';

  const sentEmails: SendInvitationEmail[] = [];

  const fakeSender: EmailSender = {
    async sendInvitation(message) {
      sentEmails.push(message);
    },
  };

  async function assertTestDatabase() {
    const rows = await prisma.$queryRaw<
      Array<{ name: string }>
    >`SELECT current_database() AS name`;

    if (rows[0]?.name !== 'rentacar_test') {
      throw new Error(
        'E2E testi yalnızca rentacar_test üzerinde çalışabilir.',
      );
    }

    databaseVerified = true;
  }

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EMAIL_SENDER)
      .useValue(fakeSender)
      .overrideProvider(InvitationDeliveryScheduler)
      .useValue({
        onModuleInit() {},
        onModuleDestroy() {},
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);

    // Veri oluşturmadan önce gerçek DB adını doğrula.
    await assertTestDatabase();

    const platformAdmin = await prisma.platformAdmin.create({
      data: {
        email: `e2e-platform-${suffix}@example.test`,
        passwordHash: 'e2e-only-placeholder',
      },
    });

    platformAdminId = platformAdmin.id;
  });

  afterAll(async () => {
    try {
      if (databaseVerified && prisma) {
        await assertTestDatabase();

        // Yalnızca bu teste ait benzersiz slug kullanılır.
        const tenant = await prisma.tenant.findUnique({
          where: { slug },
        });

        await prisma.tenantApplication.deleteMany({
          where: { slug },
        });

        if (tenant) {
          const admins = await prisma.tenantAdmin.findMany({
            where: { tenantId: tenant.id },
            select: { id: true },
          });

          const adminIds = admins.map((admin) => admin.id);

          if (adminIds.length > 0) {
            await prisma.tenantAdminSession.deleteMany({
              where: {
                tenantAdminId: { in: adminIds },
              },
            });

            await prisma.invitationDelivery.deleteMany({
              where: {
                tenantAdminId: { in: adminIds },
              },
            });

            await prisma.tenantActivationToken.deleteMany({
              where: {
                tenantAdminId: { in: adminIds },
              },
            });

            await prisma.tenantAdmin.deleteMany({
              where: {
                id: { in: adminIds },
              },
            });
          }

          await prisma.tenant.delete({
            where: { id: tenant.id },
          });
        }

        if (platformAdminId) {
          await prisma.platformAdmin.deleteMany({
            where: { id: platformAdminId },
          });
        }
      }
    } finally {
      await app?.close();
    }
  });

  it('başvurudan logout işlemine kadar onboarding akışını doğrulamalı', async () => {
    if (!app) {
      throw new Error('NestJS test uygulaması başlatılamadı.');
    }

    const jwtService = app.get(JwtService);

    // 1. Platform Admin JWT oluştur.
    const platformToken = await jwtService.signAsync({
      sub: platformAdminId,
      type: 'platform_admin',
    });

    // 2. Şirket başvurusu oluştur.
    const application = await request(app.getHttpServer())
      .post('/tenant-applications')
      .send({
        companyName: 'E2E Onboarding Rent A Car',
        slug,
        contactName: 'E2E Test Kullanıcısı',
        contactEmail: email,
        contactPhone: '+905321234567',
      })
      .expect(201);

    expect(application.body.status).toBe('PENDING');

    // 3. Platform Admin başvuruyu onaylar.
    const approval = await request(app.getHttpServer())
      .patch(
        `/admin/tenant-applications/${application.body.id}/approve`,
      )
      .set('Authorization', `Bearer ${platformToken}`)
      .expect(200);

    expect(approval.body.application.status).toBe('APPROVED');
    expect(approval.body.tenant.status).toBe('APPROVED');

    const tenantId: string = approval.body.tenant.id;

    // 4. Tenant Admin henüz aktif olmamalı.
    const admin = await prisma.tenantAdmin.findUniqueOrThrow({
      where: { tenantId },
    });

    expect(admin.email).toBe(email);
    expect(admin.passwordHash).toBeNull();
    expect(admin.activatedAt).toBeNull();

    // Aktivasyon öncesi login engellenmeli.
    await request(app.getHttpServer())
      .post('/auth/tenant/login')
      .send({ email, password })
      .expect(401);

    // 5. Oluşturulmuş davet kaydını bul.
    const delivery =
      await prisma.invitationDelivery.findFirstOrThrow({
        where: { tenantAdminId: admin.id },
        include: {
          activationToken: true,
        },
      });

    expect(delivery.status).toBe('PENDING');
    expect(delivery.encryptedToken).toBeTruthy();

    const repository = app.get(InvitationDeliveryRepository);
    const worker = app.get(InvitationDeliveryWorker);

    // Worker yalnızca bu teste ait delivery'yi işlesin.
    const originalClaimNext =
      repository.claimNext.bind(repository);

    const claimSpy = vi
      .spyOn(repository, 'claimNext')
      .mockImplementation((now, lockDurationMs) =>
        originalClaimNext(now, lockDurationMs, delivery.id),
      );

    try {
      // 6. Daveti işleme al.
      const processed = await worker.processOne();

      expect(processed).toBe(true);
    } finally {
      claimSpy.mockRestore();
    }

    // 7. Sahte gönderici aktivasyon URL'sini yakalamalı.
    expect(sentEmails).toHaveLength(1);
    expect(sentEmails[0]?.recipientEmail).toBe(email);

    const activationUrl = new URL(
      sentEmails[0].activationUrl,
    );

    expect(activationUrl.pathname).toBe('/activate');

    const activationToken =
      activationUrl.searchParams.get('token');

    expect(activationToken).toBeTruthy();

    const sentDelivery =
      await prisma.invitationDelivery.findUniqueOrThrow({
        where: { id: delivery.id },
      });

    expect(sentDelivery.status).toBe('SENT');
    expect(sentDelivery.sentAt).not.toBeNull();
    expect(sentDelivery.encryptedToken).toBeNull();

    // 8. Aktivasyon endpoint'ini gerçek HTTP ile çağır.
    await request(app.getHttpServer())
      .post('/auth/tenant/activate')
      .send({
        token: activationToken,
        password,
      })
      .expect(200);

    const activatedAdmin =
      await prisma.tenantAdmin.findUniqueOrThrow({
        where: { id: admin.id },
      });

    expect(activatedAdmin.activatedAt).not.toBeNull();
    expect(activatedAdmin.emailVerifiedAt).not.toBeNull();
    expect(activatedAdmin.passwordHash).not.toBeNull();

    // 9. Aynı aktivasyon token'ı ikinci kez çalışmamalı.
    await request(app.getHttpServer())
      .post('/auth/tenant/activate')
      .send({
        token: activationToken,
        password,
      })
      .expect(400);

    // 10. Yeni etkinleştirilen hesapla login yap.
    const login = await request(app.getHttpServer())
      .post('/auth/tenant/login')
      .send({
        email,
        password,
      })
      .expect(200);

    const accessToken: string = login.body.accessToken;
    const refreshToken: string = login.body.refreshToken;

    expect(accessToken).toBeTruthy();
    expect(refreshToken).toBeTruthy();

    // 11. Korumalı profil doğru Tenant'ı döndürmeli.
    const profile = await request(app.getHttpServer())
      .get('/tenant/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(profile.body.id).toBe(tenantId);
    expect(profile.body.name).toBe('E2E Onboarding Rent A Car');

    // 12. Logout.
    await request(app.getHttpServer())
      .post('/auth/tenant/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204);

    // 13. Eski JWT artık korumalı profile erişememeli.
    await request(app.getHttpServer())
      .get('/tenant/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(401);

    // 14. Logout sonrası refresh token da reddedilmeli.
    await request(app.getHttpServer())
      .post('/auth/tenant/refresh')
      .send({ refreshToken })
      .expect(401);
  });
});
