import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import dotenv from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';
import { randomBytes, randomUUID } from 'node:crypto';
import { TenantApplicationsService } from '../../src/tenant-applications/tenant-applications.service.js';
import { PrismaService } from '../../src/prisma/prisma.service.js';
import { ConfigService } from '@nestjs/config';
import { InvitationSecurityService } from '../../src/invitation-security/invitation-security.service.js';

// 1. Test ortamı dosyasını oku.
const envPath = new URL('../../../../.env.test', import.meta.url);
const testEnv = dotenv.parse(readFileSync(envPath));

const databaseUrl = testEnv['DATABASE_URL'];

if (!databaseUrl) {
  throw new Error('Test DATABASE_URL bulunamadı.');
}

// 2. Yanlış veritabanına bağlanmayı engelle.
const url = new URL(databaseUrl);

if (
  url.pathname !== '/rentacar_test' ||
  !['localhost', '127.0.0.1'].includes(url.hostname) ||
  url.port !== '5432'
) {
  throw new Error(
    'Entegrasyon testleri yalnızca yerel rentacar_test veritabanında çalışabilir.',
  );
}

// 3. Gerçek PostgreSQL bağlantısını oluştur.
const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({ adapter });

const testEncryptionKey = randomBytes(32).toString('hex');

const configService = {
  getOrThrow: (name: string) => {
    if (name === 'TENANT_INVITATION_ENCRYPTION_KEY') {
      return testEncryptionKey;
    }

    throw new Error(`Unexpected configuration key: ${name}`);
  },
} as ConfigService;

const invitationSecurity = new InvitationSecurityService(configService);

async function cleanupApprovalFixture(
  applicationId: string,
  slug: string,
): Promise<void> {
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
  });

  // Remove the application first so it no longer references the tenant.
  await prisma.tenantApplication.deleteMany({
    where: { id: applicationId },
  });

  if (!tenant) {
    return;
  }

  const administrator = await prisma.tenantAdmin.findUnique({
    where: { tenantId: tenant.id },
  });

  if (administrator) {
    // Remove child records before their parent.
    await prisma.invitationDelivery.deleteMany({
      where: { tenantAdminId: administrator.id },
    });

    await prisma.tenantActivationToken.deleteMany({
      where: { tenantAdminId: administrator.id },
    });

    await prisma.tenantAdmin.delete({
      where: { id: administrator.id },
    });
  }

  await prisma.tenant.delete({
    where: { id: tenant.id },
  });
}

describe('PostgreSQL Integration', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('rentacar_test veritabanına bağlanmalı', async () => {
    const result = await prisma.$queryRaw<Array<{ database_name: string }>>`
      SELECT current_database() AS database_name
    `;

    expect(result[0]?.database_name).toBe('rentacar_test');
  });

  it('transaction hata alırsa bütün değişiklikleri geri almalı', async () => {
    // Her çalıştırmada benzersiz bir slug kullanıyoruz.
    const slug = `rollback-test-${randomUUID()}`;

    // Başlangıç verisi: PENDING bir şirket başvurusu.
    const application = await prisma.tenantApplication.create({
      data: {
        companyName: 'Integration Test Rent A Car',
        slug,
        contactName: 'Test User',
        contactEmail: 'integration@example.com',
        contactPhone: '05000000000',
      },
    });

    try {
      // Transaction içinde bilerek hata oluşturacağız.
      await expect(
        prisma.$transaction(async (tx) => {
          // 1. Başvuruyu onayla.
          await tx.tenantApplication.update({
            where: { id: application.id },
            data: { status: 'APPROVED' },
          });

          // 2. Tenant oluştur.
          await tx.tenant.create({
            data: {
              name: application.companyName,
              slug,
              status: 'APPROVED',
            },
          });

          // 3. İşlemin ortasında beklenmedik hata oluşsun.
          throw new Error('Simüle edilmiş transaction hatası');
        }),
      ).rejects.toThrow('Simüle edilmiş transaction hatası');

      // Transaction bittikten sonra veritabanını tekrar sorgula.
      const savedApplication = await prisma.tenantApplication.findUnique({
        where: { id: application.id },
      });

      const savedTenant = await prisma.tenant.findUnique({
        where: { slug },
      });

      // Başvuru hâlâ PENDING olmalı.
      expect(savedApplication?.status).toBe('PENDING');

      // Tenant hiç oluşmamış olmalı.
      expect(savedTenant).toBeNull();
    } finally {
      // Testin oluşturduğu verileri temizle.
      await prisma.tenantApplication.deleteMany({
        where: { id: application.id },
      });

      await prisma.tenant.deleteMany({
        where: { slug },
      });
    }
  });

  it('gerçek approveApplication metodu başvuruyu onaylayıp Tenant oluşturmalı', async () => {
    const slug = `approve-test-${randomUUID()}`;

    const email = `approve-${randomUUID()}@example.test`;

    // 1. Test veritabanında PENDING başvuru oluştur.
    const application = await prisma.tenantApplication.create({
      data: {
        companyName: 'Integration Approval Rent A Car',
        slug,
        contactName: 'Test User',
        contactEmail: email,
        contactPhone: '05000000000',
      },
    });

    try {
      const service = new TenantApplicationsService(
        prisma as unknown as PrismaService,
        invitationSecurity,
      );

      // 3. Gerçek onaylama algoritmasını çalıştır.
      const result = await service.approveApplication(application.id);

      // 4. Servisin döndürdüğü sonucu kontrol et.
      expect(result.application.status).toBe('APPROVED');
      expect(result.tenant.status).toBe('APPROVED');

      expect(result.application.tenantId).toBe(result.tenant.id);

      // 5. Veritabanındaki gerçek kayıtları tekrar sorgula.
      const savedApplication = await prisma.tenantApplication.findUnique({
        where: { id: application.id },
      });

      const savedTenant = await prisma.tenant.findUnique({
        where: { slug },
      });

      expect(savedApplication?.status).toBe('APPROVED');
      expect(savedApplication?.tenantId).toBe(savedTenant?.id);
      expect(savedTenant?.status).toBe('APPROVED');
      expect(savedTenant?.name).toBe(application.companyName);

      const administrator = await prisma.tenantAdmin.findUniqueOrThrow({
        where: { tenantId: result.tenant.id },
      });

      expect(administrator.email).toBe(email);
      expect(administrator.passwordHash).toBeNull();
      expect(administrator.activatedAt).toBeNull();

      const tokens = await prisma.tenantActivationToken.findMany({
        where: { tenantAdminId: administrator.id },
      });

      expect(tokens).toHaveLength(1);

      const deliveries = await prisma.invitationDelivery.findMany({
        where: { tenantAdminId: administrator.id },
      });

      expect(deliveries).toHaveLength(1);
      expect(deliveries[0].status).toBe('PENDING');
    } finally {
      await cleanupApprovalFixture(application.id, slug);
    }
  });

  it('eşzamanlı onaylama ve reddetmeden yalnızca biri başarılı olmalı', async () => {
    const slug = `concurrent-test-${randomUUID()}`;
    const email = `concurrent-${randomUUID()}@example.test`;

    const application = await prisma.tenantApplication.create({
      data: {
        companyName: 'Concurrent Test Rent A Car',
        slug,
        contactName: 'Test User',
        contactEmail: email,
        contactPhone: '05000000000',
      },
    });

    try {
      const service = new TenantApplicationsService(
        prisma as unknown as PrismaService,
        invitationSecurity,
      );

      // İki işlemi birbirini beklemeden başlat.
      const results = await Promise.allSettled([
        service.approveApplication(application.id),
        service.rejectApplication(application.id),
      ]);

      // Yalnızca bir işlem başarılı olmalı.
      const successful = results.filter(
        (result) => result.status === 'fulfilled',
      );

      const failed = results.filter((result) => result.status === 'rejected');

      expect(successful).toHaveLength(1);
      expect(failed).toHaveLength(1);

      // Veritabanının son durumunu kontrol et.
      const savedApplication = await prisma.tenantApplication.findUniqueOrThrow(
        {
          where: { id: application.id },
        },
      );

      const savedTenant = await prisma.tenant.findUnique({
        where: { slug },
      });

      if (savedApplication.status === 'APPROVED') {
        expect(savedTenant).not.toBeNull();
        expect(savedApplication.tenantId).toBe(savedTenant?.id);
      } else {
        expect(savedApplication.status).toBe('REJECTED');
        expect(savedApplication.tenantId).toBeNull();
        expect(savedTenant).toBeNull();
      }
    } finally {
      await cleanupApprovalFixture(application.id, slug);
    }
  });
});
