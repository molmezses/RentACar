
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Test } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import request from 'supertest';

import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, randomUUID } from 'node:crypto';

describe('Vehicle Status E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tenantId: string | undefined;
  let adminId: string | undefined;
  let vehicleId: string | undefined;
  let tenantToken: string;
  let tenantBId: string | undefined;
  let vehicleBId: string | undefined;

  const suffix = randomUUID();

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    prisma = app.get(PrismaService);

    const result = await prisma.$queryRaw<
      Array<{ name: string }>
    >`SELECT current_database() AS name`;

    if (result[0]?.name !== 'rentacar_test') {
      throw new Error(
        'E2E testleri yalnızca rentacar_test üzerinde çalışabilir.',
      );
    }
    const tenant = await prisma.tenant.create({
    data: {
        name: 'G4 E2E Test Rent A Car',
        slug: `g4-e2e-${suffix}`,
        status: 'APPROVED',
    },
    });

    tenantId = tenant.id;

    const now = new Date();

    const admin = await prisma.tenantAdmin.create({
    data: {
        tenantId: tenant.id,
        email: `g4-e2e-${suffix}@example.test`,
        passwordHash: 'e2e-test-password-hash',
        activatedAt: now,
        emailVerifiedAt: now,
    },
    });

    adminId = admin.id;

    const session = await prisma.tenantAdminSession.create({
    data: {
        tenantAdminId: admin.id,
        refreshTokenHash: randomBytes(32).toString('hex'),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
    });

    const jwtService = app.get(JwtService);

    tenantToken = await jwtService.signAsync({
    sub: admin.id,
    type: 'tenant_admin',
    tenantId: tenant.id,
    sessionId: session.id,
    });

    const vehicle = await prisma.vehicle.create({
    data: {
        tenantId: tenant.id,
        plate: `G4-${suffix.slice(0, 8)}`,
        make: 'Toyota',
        model: 'Corolla',
        modelYear: 2024,
        category: 'SEDAN',
        transmission: 'AUTOMATIC',
        fuelType: 'HYBRID',
        seatCount: 5,
        odometerKm: 45000,
        dailyPrice: '1500.00',
        currency: 'TRY',
        fleetStatus: 'ACTIVE',
        deactivatedAt: null,
    },
    });

    vehicleId = vehicle.id;

const tenantB = await prisma.tenant.create({
  data: {
    name: 'G4 E2E Tenant B Rent A Car',
    slug: `g4-e2e-b-${suffix}`,
    status: 'APPROVED',
  },
});

tenantBId = tenantB.id;

const vehicleB = await prisma.vehicle.create({
  data: {
    tenantId: tenantB.id,
    plate: `G4B-${suffix.slice(0, 8)}`,
    make: 'BMW',
    model: '320i',
    modelYear: 2025,
    category: 'SEDAN',
    transmission: 'AUTOMATIC',
    fuelType: 'HYBRID',
    seatCount: 5,
    odometerKm: 15000,
    dailyPrice: '2500.00',
    currency: 'TRY',
    fleetStatus: 'ACTIVE',
    deactivatedAt: null,
  },
});

vehicleBId = vehicleB.id;


  });

    afterAll(async () => {
    try {
        if (prisma) {
        const result = await prisma.$queryRaw<
            Array<{ name: string }>
        >`SELECT current_database() AS name`;

        if (result[0]?.name !== 'rentacar_test') {
            throw new Error('Test veritabanı dışında silme yapılamaz.');
        }

        const vehicleIds = [vehicleId, vehicleBId].filter(
        (id): id is string => Boolean(id),
        );

        if (vehicleIds.length > 0) {
        await prisma.vehicle.deleteMany({
            where: {
            id: { in: vehicleIds },
            },
        });
        }

        if (adminId) {
            await prisma.tenantAdminSession.deleteMany({
            where: { tenantAdminId: adminId },
            });

            await prisma.tenantAdmin.deleteMany({
            where: { id: adminId },
            });
        }

        
    const tenantIds = [tenantId, tenantBId].filter(
    (id): id is string => Boolean(id),
    );

    if (tenantIds.length > 0) {
    await prisma.tenant.deleteMany({
        where: {
        id: { in: tenantIds },
        },
    });
    }}
    } finally {
        await app?.close();
    }
    });

  it('JWT olmadan araç durumu değiştirilemez (401)', async () => {
    const response = await request(app.getHttpServer())
      .patch('/tenant/vehicles/vehicle_1/status')
      .send({
        fleetStatus: 'INACTIVE',
      })
      .expect(401);

    expect(response.body.statusCode).toBe(401);
  });


it('geçerli JWT ile ACTIVE araç INACTIVE yapılır', async () => {
  if (!vehicleId) {
    throw new Error('Test aracı oluşturulmadı.');
  }

    // Testin başlangıç durumunu ACTIVE yapıyoruz.
    await prisma.vehicle.update({
    where: { id: vehicleId },
    data: {
        fleetStatus: 'ACTIVE',
        deactivatedAt: null,
    },
    });

  const response = await request(app.getHttpServer())
    .patch(`/tenant/vehicles/${vehicleId}/status`)
    .set('Authorization', `Bearer ${tenantToken}`)
    .send({
      fleetStatus: 'INACTIVE',
    })
    .expect(200);

  expect(response.body.id).toBe(vehicleId);
  expect(response.body.fleetStatus).toBe('INACTIVE');
  expect(response.body.deactivatedAt).toEqual(
    expect.any(String),
  );
  expect(response.body).not.toHaveProperty('tenantId');

  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
  });

  expect(vehicle?.fleetStatus).toBe('INACTIVE');
  expect(vehicle?.deactivatedAt).toBeInstanceOf(Date);

  expect(response.body.deactivatedAt).toBe(
    vehicle?.deactivatedAt?.toISOString(),
  );
});


it('tekrarlanan INACTIVE isteği pasifleştirme tarihini değiştirmez', async () => {
  if (!vehicleId) {
    throw new Error('Test aracı oluşturulmadı.');
  }


const originalDeactivatedAt = new Date(
  '2026-11-24T14:00:00.000Z',
);

    // Testin başlangıç durumunu diğer testlerden bağımsız hazırlıyoruz.
    await prisma.vehicle.update({
    where: { id: vehicleId },
    data: {
        fleetStatus: 'INACTIVE',
        deactivatedAt: originalDeactivatedAt,
    },
    });

  const before = await prisma.vehicle.findUniqueOrThrow({
    where: { id: vehicleId },
  });

  expect(before.fleetStatus).toBe('INACTIVE');
  expect(before.deactivatedAt).toBeInstanceOf(Date);

  const response = await request(app.getHttpServer())
    .patch(`/tenant/vehicles/${vehicleId}/status`)
    .set('Authorization', `Bearer ${tenantToken}`)
    .send({
      fleetStatus: 'INACTIVE',
    })
    .expect(200);

  const after = await prisma.vehicle.findUniqueOrThrow({
    where: { id: vehicleId },
  });

  expect(response.body.fleetStatus).toBe('INACTIVE');

  expect(after.deactivatedAt?.toISOString()).toBe(
    before.deactivatedAt?.toISOString(),
  );

  expect(after.updatedAt.toISOString()).toBe(
    before.updatedAt.toISOString(),
  );
});

it('INACTIVE araç yeniden ACTIVE yapılır ve tarih temizlenir', async () => {
  if (!vehicleId) {
    throw new Error('Test aracı oluşturulmadı.');
  }

  // Başlangıç durumunu açıkça hazırlıyoruz.
  await prisma.vehicle.update({
    where: { id: vehicleId },
    data: {
      fleetStatus: 'INACTIVE',
      deactivatedAt: new Date('2026-11-24T12:00:00.000Z'),
    },
  });

  const before = await prisma.vehicle.findUniqueOrThrow({
    where: { id: vehicleId },
  });

  const response = await request(app.getHttpServer())
    .patch(`/tenant/vehicles/${vehicleId}/status`)
    .set('Authorization', `Bearer ${tenantToken}`)
    .send({
      fleetStatus: 'ACTIVE',
    })
    .expect(200);

  const after = await prisma.vehicle.findUniqueOrThrow({
    where: { id: vehicleId },
  });

  // API yanıtını kontrol ediyoruz.
  expect(response.body.fleetStatus).toBe('ACTIVE');
  expect(response.body.deactivatedAt).toBeNull();

  // Gerçek veritabanını kontrol ediyoruz.
  expect(after.fleetStatus).toBe('ACTIVE');
  expect(after.deactivatedAt).toBeNull();

  // Güncelleme zamanının geriye gitmediğini doğruluyoruz.
  expect(after.updatedAt.getTime()).toBeGreaterThanOrEqual(
    before.updatedAt.getTime(),
  );
});

it('bulunmayan aracın durumu değiştirilemez (404)', async () => {
  const response = await request(app.getHttpServer())
    .patch('/tenant/vehicles/nonexistent-vehicle-id/status')
    .set('Authorization', `Bearer ${tenantToken}`)
    .send({
      fleetStatus: 'INACTIVE',
    })
    .expect(404);

  expect(response.body.statusCode).toBe(404);
  expect(response.body.message).toBe('Vehicle not found');
});

it('Tenant A başka Tenant aracının durumunu değiştiremez (404)', async () => {
  if (!vehicleBId) {
    throw new Error('Tenant B test aracı oluşturulmadı.');
  }

  const before = await prisma.vehicle.findUniqueOrThrow({
    where: { id: vehicleBId },
  });

  const response = await request(app.getHttpServer())
    .patch(`/tenant/vehicles/${vehicleBId}/status`)
    .set('Authorization', `Bearer ${tenantToken}`)
    .send({
      fleetStatus: 'INACTIVE',
    })
    .expect(404);

  expect(response.body.message).toBe('Vehicle not found');

  const after = await prisma.vehicle.findUniqueOrThrow({
    where: { id: vehicleBId },
  });

  expect(after.fleetStatus).toBe(before.fleetStatus);
  expect(after.deactivatedAt).toEqual(before.deactivatedAt);
  expect(after.updatedAt).toEqual(before.updatedAt);
});

it('geçersiz fleetStatus değeri HTTP 400 döndürür', async () => {
  if (!vehicleId) {
    throw new Error('Test aracı oluşturulmadı.');
  }

  const response = await request(app.getHttpServer())
    .patch(`/tenant/vehicles/${vehicleId}/status`)
    .set('Authorization', `Bearer ${tenantToken}`)
    .send({
      fleetStatus: 'PENDING',
    })
    .expect(400);

  expect(response.body.statusCode).toBe(400);
});

it('fleetStatus gönderilmezse HTTP 400 döndürür', async () => {
  if (!vehicleId) {
    throw new Error('Test aracı oluşturulmadı.');
  }

  await request(app.getHttpServer())
    .patch(`/tenant/vehicles/${vehicleId}/status`)
    .set('Authorization', `Bearer ${tenantToken}`)
    .send({})
    .expect(400);
});

it('request body içindeki tenantId alanı reddedilir', async () => {
  if (!vehicleId || !tenantBId) {
    throw new Error('Test verileri oluşturulmadı.');
  }

  await request(app.getHttpServer())
    .patch(`/tenant/vehicles/${vehicleId}/status`)
    .set('Authorization', `Bearer ${tenantToken}`)
    .send({
      fleetStatus: 'INACTIVE',
      tenantId: tenantBId,
    })
    .expect(400);
});

it('tekrarlanan ACTIVE isteği updatedAt değerini değiştirmez', async () => {
  if (!vehicleId) {
    throw new Error('Test aracı oluşturulmadı.');
  }

  // Arrange: Aracı aktif durumda hazırlıyoruz.
  await prisma.vehicle.update({
    where: { id: vehicleId },
    data: {
      fleetStatus: 'ACTIVE',
      deactivatedAt: null,
    },
  });

  const before = await prisma.vehicle.findUniqueOrThrow({
    where: { id: vehicleId },
  });

  // Act: Zaten aktif olan aracı tekrar aktif yapmaya çalışıyoruz.
  const response = await request(app.getHttpServer())
    .patch(`/tenant/vehicles/${vehicleId}/status`)
    .set('Authorization', `Bearer ${tenantToken}`)
    .send({
      fleetStatus: 'ACTIVE',
    })
    .expect(200);

  const after = await prisma.vehicle.findUniqueOrThrow({
    where: { id: vehicleId },
  });

  // Assert: Durum ve tarihler değişmemeli.
  expect(response.body.fleetStatus).toBe('ACTIVE');
  expect(response.body.deactivatedAt).toBeNull();

  expect(after.fleetStatus).toBe('ACTIVE');
  expect(after.deactivatedAt).toBeNull();

  expect(after.updatedAt.getTime()).toBe(
    before.updatedAt.getTime(),
  );
});

});
