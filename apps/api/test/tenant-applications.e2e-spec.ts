import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import request from 'supertest';
import { randomUUID } from 'node:crypto';

describe('Tenant Applications E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let testAdminId: string | undefined;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();

    // Veri oluşturmadan önce gerçek bağlantıyı kontrol et.
    prisma = app.get(PrismaService);

    const result = await prisma.$queryRaw<Array<{ database_name: string }>>`
      SELECT current_database() AS database_name
    `;

    if (result[0]?.database_name !== 'rentacar_test') {
      throw new Error(
        'Güvenlik: E2E testleri yalnızca rentacar_test üzerinde çalışabilir.',
      );
    }

    // Yalnızca doğrulanmış test veritabanında yönetici oluştur.
    const admin = await prisma.platformAdmin.create({
      data: {
        email: `e2e-admin-${randomUUID()}@example.com`,
        passwordHash: 'e2e-only-not-a-real-password-hash',
      },
    });

    testAdminId = admin.id;

    // Uygulamanın kendi JWT servisiyle test token'ı oluştur.
    const jwtService = app.get(JwtService);

    adminToken = await jwtService.signAsync({
      sub: admin.id,
      type: 'platform_admin',
    });
  });

  afterAll(async () => {
    try {
      if (app && testAdminId) {
        const prisma = app.get(PrismaService);

        await prisma.platformAdmin.deleteMany({
          where: { id: testAdminId },
        });
      }
    } finally {
      await app?.close();
    }
  });

  it('NestJS uygulaması test veritabanına bağlanmalı', () => {
    expect(app).toBeDefined();
  });

  it('POST /tenant-applications ile PENDING başvuru oluşturmalı', async () => {
    const prisma = app.get(PrismaService);
    const slug = `e2e-create-${randomUUID()}`;

    let applicationId: string | undefined;

    try {
      const response = await request(app.getHttpServer())
        .post('/tenant-applications')
        .send({
          companyName: 'E2E Test Rent A Car',
          slug,
          contactName: 'Test Kullanıcısı',
          contactEmail: 'e2e@example.com',
          contactPhone: '+905321234567',
        })
        .expect(201);

      expect(response.body.slug).toBe(slug);
      expect(response.body.status).toBe('PENDING');

      applicationId = response.body.id;

      const savedApplication = await prisma.tenantApplication.findUnique({
        where: { id: applicationId },
      });

      expect(savedApplication).not.toBeNull();
      expect(savedApplication?.status).toBe('PENDING');
    } finally {
      // Hata oluşsa bile yalnızca bu testin verisini temizle.
      await prisma.tenantApplication.deleteMany({
        where: { slug },
      });
    }
  });

  it('JWT olmadan admin başvuru listesine erişimi reddetmeli', async () => {
    await request(app.getHttpServer())
      .get('/admin/tenant-applications')
      .expect(401);
  });

  it('geçerli JWT ile admin başvurularını listelemeli', async () => {
    const response = await request(app.getHttpServer())
      .get('/admin/tenant-applications')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('oluşturulan başvuruyu admin listesinde ve detayında göstermeli', async () => {
    const slug = `e2e-flow-${randomUUID()}`;

    try {
      // 1. API üzerinden başvuru oluştur.
      const created = await request(app.getHttpServer())
        .post('/tenant-applications')
        .send({
          companyName: 'E2E Workflow Rent A Car',
          slug,
          contactName: 'Test Kullanıcısı',
          contactEmail: 'workflow@example.com',
          contactPhone: '+905321234567',
        })
        .expect(201);

      const applicationId: string = created.body.id;

      expect(created.body.status).toBe('PENDING');

      // 2. Admin başvuru listesini getir.
      const listResponse = await request(app.getHttpServer())
        .get('/admin/tenant-applications')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(
        listResponse.body.some(
          (item: { id: string }) => item.id === applicationId,
        ),
      ).toBe(true);

      // 3. Aynı başvurunun detayını getir.
      const detailResponse = await request(app.getHttpServer())
        .get(`/admin/tenant-applications/${applicationId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(detailResponse.body.id).toBe(applicationId);
      expect(detailResponse.body.slug).toBe(slug);
      expect(detailResponse.body.status).toBe('PENDING');
    } finally {
      // Yalnızca bu testin oluşturduğu başvuruyu temizle.
      await prisma.tenantApplication.deleteMany({
        where: { slug },
      });
    }
  });

  it('admin başvuruyu onayladığında Tenant oluşturmalı', async () => {
    const slug = `e2e-approve-${randomUUID()}`;

    try {
      // 1. Yeni başvuru oluştur.
      const created = await request(app.getHttpServer())
        .post('/tenant-applications')
        .send({
          companyName: 'E2E Approval Rent A Car',
          slug,
          contactName: 'Test Kullanıcısı',
          contactEmail: 'approval-e2e@example.com',
          contactPhone: '+905321234567',
        })
        .expect(201);

      const applicationId: string = created.body.id;

      // 2. Admin JWT ile başvuruyu onayla.
      const approved = await request(app.getHttpServer())
        .patch(`/admin/tenant-applications/${applicationId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(approved.body.application.status).toBe('APPROVED');
      expect(approved.body.tenant.status).toBe('APPROVED');

      // 3. Gerçek veritabanı durumunu kontrol et.
      const savedApplication = await prisma.tenantApplication.findUnique({
        where: { id: applicationId },
      });

      const savedTenant = await prisma.tenant.findUnique({
        where: { slug },
      });

      expect(savedTenant).not.toBeNull();
      expect(savedApplication?.status).toBe('APPROVED');
      expect(savedApplication?.tenantId).toBe(savedTenant?.id);
      expect(savedTenant?.name).toBe('E2E Approval Rent A Car');
    } finally {
      // Önce başvuruyu, sonra ilişkili Tenant kaydını temizle.
      await prisma.tenantApplication.deleteMany({
        where: { slug },
      });

      await prisma.tenant.deleteMany({
        where: { slug },
      });
    }
  });

  it('admin başvuruyu reddettiğinde Tenant oluşturmamalı', async () => {
    const slug = `e2e-reject-${randomUUID()}`;

    try {
      // 1. PENDING başvuru oluştur.
      const created = await request(app.getHttpServer())
        .post('/tenant-applications')
        .send({
          companyName: 'E2E Rejection Rent A Car',
          slug,
          contactName: 'Test Kullanıcısı',
          contactEmail: 'rejection-e2e@example.com',
          contactPhone: '+905321234567',
        })
        .expect(201);

      const applicationId: string = created.body.id;

      // 2. Admin JWT ile başvuruyu reddet.
      const rejected = await request(app.getHttpServer())
        .patch(`/admin/tenant-applications/${applicationId}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(rejected.body.status).toBe('REJECTED');
      expect(rejected.body.tenantId).toBeNull();

      // 3. Gerçek veritabanı durumunu kontrol et.
      const savedApplication = await prisma.tenantApplication.findUnique({
        where: { id: applicationId },
      });

      const savedTenant = await prisma.tenant.findUnique({
        where: { slug },
      });

      expect(savedApplication?.status).toBe('REJECTED');
      expect(savedApplication?.tenantId).toBeNull();
      expect(savedTenant).toBeNull();
    } finally {
      // Yalnızca bu teste ait kayıtları temizle.
      await prisma.tenantApplication.deleteMany({
        where: { slug },
      });

      await prisma.tenant.deleteMany({
        where: { slug },
      });
    }
  });

  it('bulunmayan başvuru ID için 404 dönmeli', async () => {
    const missingId = `missing-${randomUUID()}`;

    await request(app.getHttpServer())
      .get(`/admin/tenant-applications/${missingId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
  });

  it('onaylanmış başvurunun tekrar onaylanmasını engellemeli', async () => {
    const slug = `e2e-double-approve-${randomUUID()}`;

    try {
      // 1. Yeni başvuru oluştur.
      const created = await request(app.getHttpServer())
        .post('/tenant-applications')
        .send({
          companyName: 'E2E Double Approval Rent A Car',
          slug,
          contactName: 'Test Kullanıcısı',
          contactEmail: 'double-approval@example.com',
          contactPhone: '+905321234567',
        })
        .expect(201);

      const applicationId: string = created.body.id;

      // 2. İlk onay başarılı olmalı.
      await request(app.getHttpServer())
        .patch(`/admin/tenant-applications/${applicationId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // 3. İkinci onay 409 ile reddedilmeli.
      await request(app.getHttpServer())
        .patch(`/admin/tenant-applications/${applicationId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(409);

      // 4. Başvurunun durumu değişmemiş olmalı.
      const savedApplication = await prisma.tenantApplication.findUnique({
        where: { id: applicationId },
      });

      expect(savedApplication?.status).toBe('APPROVED');

      // 5. Yalnızca bir Tenant oluşturulmuş olmalı.
      const tenantCount = await prisma.tenant.count({
        where: { slug },
      });

      expect(tenantCount).toBe(1);
    } finally {
      // Test kayıtlarını temizle.
      await prisma.tenantApplication.deleteMany({
        where: { slug },
      });

      await prisma.tenant.deleteMany({
        where: { slug },
      });
    }
  });

  it('reddedilmiş başvurunun onaylanmasını engellemeli', async () => {
    const slug = `e2e-rejected-approve-${randomUUID()}`;

    try {
      // 1. Yeni başvuru oluştur.
      const created = await request(app.getHttpServer())
        .post('/tenant-applications')
        .send({
          companyName: 'E2E Rejected Approval Rent A Car',
          slug,
          contactName: 'Test Kullanıcısı',
          contactEmail: 'rejected-approve@example.com',
          contactPhone: '+905321234567',
        })
        .expect(201);

      const applicationId: string = created.body.id;

      // 2. Başvuruyu reddet.
      await request(app.getHttpServer())
        .patch(`/admin/tenant-applications/${applicationId}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // 3. Reddedilmiş başvuruyu onaylamayı dene.
      await request(app.getHttpServer())
        .patch(`/admin/tenant-applications/${applicationId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(409);

      // 4. Başvuru REJECTED durumunda kalmalı.
      const savedApplication = await prisma.tenantApplication.findUnique({
        where: { id: applicationId },
      });

      expect(savedApplication?.status).toBe('REJECTED');
      expect(savedApplication?.tenantId).toBeNull();

      // 5. Tenant oluşturulmamalı.
      const tenantCount = await prisma.tenant.count({
        where: { slug },
      });

      expect(tenantCount).toBe(0);
    } finally {
      // Yalnızca teste ait kayıtları temizle.
      await prisma.tenantApplication.deleteMany({
        where: { slug },
      });

      await prisma.tenant.deleteMany({
        where: { slug },
      });
    }
  });

  it('geçersiz JWT ile admin işlemlerine erişimi reddetmeli', async () => {
    await request(app.getHttpServer())
      .get('/admin/tenant-applications')
      .set('Authorization', 'Bearer invalid-test-token')
      .expect(401);
  });

  it('JWT olmadan başvuru onaylama ve reddetmeyi engellemeli', async () => {
    const missingId = `missing-${randomUUID()}`;

    // JWT olmadan onaylama.
    await request(app.getHttpServer())
      .patch(`/admin/tenant-applications/${missingId}/approve`)
      .expect(401);

    // JWT olmadan reddetme.
    await request(app.getHttpServer())
      .patch(`/admin/tenant-applications/${missingId}/reject`)
      .expect(401);
  });
});
