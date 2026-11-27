import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Test } from "@nestjs/testing";
import { ValidationPipe, type INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { randomBytes, randomUUID } from "node:crypto";
import request from "supertest";

import { AppModule } from "../src/app.module.js";
import { PrismaService } from "../src/prisma/prisma.service.js";

describe("Tenant Isolation E2E", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let tenantAId: string | undefined;
  let tenantBId: string | undefined;
  let adminAId: string | undefined;
  let adminBId: string | undefined;

  let tenantAToken: string;
  let tenantBToken: string;
  let platformToken: string;

  const suffix = randomUUID();

  const slugA = `e2e-isolation-a-${suffix}`;
  const slugB = `e2e-isolation-b-${suffix}`;

  async function assertTestDatabase() {
    const result = await prisma.$queryRaw<
      Array<{ name: string }>
    >`SELECT current_database() AS name`;

    if (result[0]?.name !== "rentacar_test") {
      throw new Error("Güvenlik: yalnızca rentacar_test kullanılabilir.");
    }
  }

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

    // Herhangi bir kayıt oluşturmadan önce doğrula.
    await assertTestDatabase();

    const tenantA = await prisma.tenant.create({
      data: {
        name: "E2E ABC Rent A Car",
        slug: slugA,
        status: "APPROVED",
      },
    });

    tenantAId = tenantA.id;

    const tenantB = await prisma.tenant.create({
      data: {
        name: "E2E XYZ Rent A Car",
        slug: slugB,
        status: "APPROVED",
      },
    });

    tenantBId = tenantB.id;

    const now = new Date();

    const adminA = await prisma.tenantAdmin.create({
      data: {
        tenantId: tenantA.id,
        email: `e2e-a-${suffix}@example.test`,
        passwordHash: "e2e-test-password-hash",
        activatedAt: now,
        emailVerifiedAt: now,
      },
    });

    adminAId = adminA.id;

    const adminB = await prisma.tenantAdmin.create({
      data: {
        tenantId: tenantB.id,
        email: `e2e-b-${suffix}@example.test`,
        passwordHash: "e2e-test-password-hash",
        activatedAt: now,
        emailVerifiedAt: now,
      },
    });

    adminBId = adminB.id;

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    const sessionA = await prisma.tenantAdminSession.create({
      data: {
        tenantAdminId: adminA.id,
        refreshTokenHash: randomBytes(32).toString("hex"),
        expiresAt,
      },
    });

    const sessionB = await prisma.tenantAdminSession.create({
      data: {
        tenantAdminId: adminB.id,
        refreshTokenHash: randomBytes(32).toString("hex"),
        expiresAt,
      },
    });

    const jwtService = app.get(JwtService);

    tenantAToken = await jwtService.signAsync({
      sub: adminA.id,
      type: "tenant_admin",
      tenantId: tenantA.id,
      sessionId: sessionA.id,
    });

    tenantBToken = await jwtService.signAsync({
      sub: adminB.id,
      type: "tenant_admin",
      tenantId: tenantB.id,
      sessionId: sessionB.id,
    });

    platformToken = await jwtService.signAsync({
      sub: `e2e-platform-${suffix}`,
      type: "platform_admin",
    });
  });

  afterAll(async () => {
    try {
      if (prisma) {
        await assertTestDatabase();

        const adminIds = [adminAId, adminBId].filter((id): id is string =>
          Boolean(id),
        );

        const tenantIds = [tenantAId, tenantBId].filter((id): id is string =>
          Boolean(id),
        );

        if (adminIds.length > 0) {
          await prisma.tenantAdminSession.deleteMany({
            where: {
              tenantAdminId: { in: adminIds },
            },
          });

          await prisma.tenantActivationToken.deleteMany({
            where: {
              tenantAdminId: { in: adminIds },
            },
          });

          await prisma.invitationDelivery.deleteMany({
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

        if (tenantIds.length > 0) {
          // Önce bu teste ait araçları sil.
          // Vehicle -> Tenant ilişkisinde onDelete: Restrict kullanıyoruz.
          await prisma.vehicle.deleteMany({
            where: {
              tenantId: { in: tenantIds },
            },
          });

          // Ardından test Tenant kayıtlarını temizle.
          await prisma.tenant.deleteMany({
            where: {
              id: { in: tenantIds },
            },
          });
        }
      }
    } finally {
      await app?.close();
    }
  });

  it("Tenant A yalnızca kendi profilini görmeli", async () => {
    const response = await request(app.getHttpServer())
      .get("/tenant/profile")
      .set("Authorization", `Bearer ${tenantAToken}`)
      .expect(200);

    expect(response.body.id).toBe(tenantAId);
    expect(response.body.name).toBe("E2E ABC Rent A Car");
    expect(response.body.id).not.toBe(tenantBId);
  });

  it("Tenant B yalnızca kendi profilini görmeli", async () => {
    const response = await request(app.getHttpServer())
      .get("/tenant/profile")
      .set("Authorization", `Bearer ${tenantBToken}`)
      .expect(200);

    expect(response.body.id).toBe(tenantBId);
    expect(response.body.name).toBe("E2E XYZ Rent A Car");
    expect(response.body.id).not.toBe(tenantAId);
  });

  it("query parametresindeki tenantId oturum kimliğini değiştirmemeli", async () => {
    const response = await request(app.getHttpServer())
      .get("/tenant/profile")
      .query({ tenantId: tenantBId })
      .set("Authorization", `Bearer ${tenantAToken}`)
      .expect(200);

    // İstek B şirketini hedeflese de A profili dönmeli.
    expect(response.body.id).toBe(tenantAId);
    expect(response.body.id).not.toBe(tenantBId);
  });

  it("Platform Admin JWT ile Tenant profiline girilememeli", async () => {
    await request(app.getHttpServer())
      .get("/tenant/profile")
      .set("Authorization", `Bearer ${platformToken}`)
      .expect(401);
  });

  it("Tenant Admin JWT ile Platform Admin endpointine girilememeli", async () => {
    await request(app.getHttpServer())
      .get("/admin/tenant-applications")
      .set("Authorization", `Bearer ${tenantAToken}`)
      .expect(401);
  });

  it("kimlik doğrulaması olmadan Tenant profiline erişilememeli", async () => {
    await request(app.getHttpServer()).get("/tenant/profile").expect(401);
  });

  describe("Vehicle Create E2E", () => {
    const validVehicle = () => ({
      plate: "38 E2E 100",
      make: "Toyota",
      model: "Corolla",
      modelYear: 2024,
      category: "SEDAN",
      transmission: "AUTOMATIC",
      fuelType: "HYBRID",
      seatCount: 5,
      odometerKm: 25000,
      dailyPrice: "1500.00",
      currency: "TRY",
    });

    it("Tenant JWT olmadan araç oluşturulamaz", async () => {
      await request(app.getHttpServer())
        .post("/tenant/vehicles")
        .send(validVehicle())
        .expect(401);
    });

    it("Platform Admin JWT ile araç oluşturulamaz", async () => {
      await request(app.getHttpServer())
        .post("/tenant/vehicles")
        .set("Authorization", `Bearer ${platformToken}`)
        .send(validVehicle())
        .expect(401);
    });

    it("istemciden tenantId gönderilirse 400 döner", async () => {
      await request(app.getHttpServer())
        .post("/tenant/vehicles")
        .set("Authorization", `Bearer ${tenantAToken}`)
        .send({
          ...validVehicle(),
          tenantId: tenantBId,
        })
        .expect(400);
    });

    it("hatalı fiyat ve koltuk sayısını reddeder", async () => {
      await request(app.getHttpServer())
        .post("/tenant/vehicles")
        .set("Authorization", `Bearer ${tenantAToken}`)
        .send({
          ...validVehicle(),
          dailyPrice: "0",
          seatCount: 25,
        })
        .expect(400);
    });

    it("Tenant izolasyonu ve duplicate plakayı korur", async () => {
      // 1. Tenant A araç oluşturur.
      const createdA = await request(app.getHttpServer())
        .post("/tenant/vehicles")
        .set("Authorization", `Bearer ${tenantAToken}`)
        .send({
          ...validVehicle(),
          plate: " 38 e2e 100 ",
        })
        .expect(201);

      const vehicleAId = createdA.body.id as string;

      expect(vehicleAId).toBeTruthy();
      expect(createdA.body.plate).toBe("38 E2E 100");
      expect(createdA.body.fleetStatus).toBe("ACTIVE");
      expect(createdA.body.dailyPrice).toBe("1500.00");
      expect(createdA.body).not.toHaveProperty("tenantId");

      // PostgreSQL'deki sahipliği de kontrol et.
      const storedA = await prisma.vehicle.findUniqueOrThrow({
        where: { id: vehicleAId },
      });

      expect(storedA.tenantId).toBe(tenantAId);

      // 2. Tenant A aynı plakayı tekrar kaydedemez.
      await request(app.getHttpServer())
        .post("/tenant/vehicles")
        .set("Authorization", `Bearer ${tenantAToken}`)
        .send(validVehicle())
        .expect(409);

      // 3. Tenant B, A'nın aracını listeleyemez.
      const listB = await request(app.getHttpServer())
        .get("/tenant/vehicles")
        .set("Authorization", `Bearer ${tenantBToken}`)
        .expect(200);

      expect(
        listB.body.items.some(
          (vehicle: { id: string }) => vehicle.id === vehicleAId,
        ),
      ).toBe(false);

      // 4. Tenant B, A'nın araç detayına erişemez.
      await request(app.getHttpServer())
        .get(`/tenant/vehicles/${vehicleAId}`)
        .set("Authorization", `Bearer ${tenantBToken}`)
        .expect(404);

      // 5. Tenant B aynı plakayı kendi filosuna ekleyebilir.
      const createdB = await request(app.getHttpServer())
        .post("/tenant/vehicles")
        .set("Authorization", `Bearer ${tenantBToken}`)
        .send(validVehicle())
        .expect(201);

      expect(createdB.body.id).not.toBe(vehicleAId);

      const storedB = await prisma.vehicle.findUniqueOrThrow({
        where: { id: createdB.body.id as string },
      });

      expect(storedB.tenantId).toBe(tenantBId);

      // 6. Tenant B aynı plakayı ikinci kez ekleyemez.
      await request(app.getHttpServer())
        .post("/tenant/vehicles")
        .set("Authorization", `Bearer ${tenantBToken}`)
        .send(validVehicle())
        .expect(409);
    });
  });

  const createTestVehicle = async (tenantId: string) => {
    await assertTestDatabase();

    return prisma.vehicle.create({
      data: {
        tenantId,
        plate: `E2E ${randomUUID().slice(0, 8).toUpperCase()}`,
        make: "Toyota",
        model: "Corolla",
        modelYear: 2024,
        category: "SEDAN",
        transmission: "AUTOMATIC",
        fuelType: "HYBRID",
        seatCount: 5,
        odometerKm: 45000,
        dailyPrice: "1500.00",
        currency: "TRY",
        color: "Beyaz",
        depositAmount: "3000.00",
        hasAirConditioning: true,
      },
    });
  };
  describe("Vehicle Update E2E", () => {
    // Her test için ayrı bir araç oluşturuyoruz.
    // Böylece testler birbirinin verisini değiştirmiyor.

    it("Tenant kendi aracını başarıyla günceller", async () => {
      const vehicle = await createTestVehicle(tenantAId!);

      const response = await request(app.getHttpServer())
        .patch(`/tenant/vehicles/${vehicle.id}`)
        .set("Authorization", `Bearer ${tenantAToken}`)
        .send({
          make: "Honda",
          model: "Civic",
          dailyPrice: "1850.50",
        })
        .expect(200);

      expect(response.body.make).toBe("Honda");
      expect(response.body.model).toBe("Civic");
      expect(response.body.dailyPrice).toBe("1850.50");
      expect(response.body).not.toHaveProperty("tenantId");

      // Gerçek PostgreSQL kaydını kontrol et.
      const stored = await prisma.vehicle.findUniqueOrThrow({
        where: { id: vehicle.id },
      });

      expect(stored.make).toBe("Honda");
      expect(stored.model).toBe("Civic");
      expect(stored.dailyPrice.toFixed(2)).toBe("1850.50");

      // Gönderilmeyen alan korunmalı.
      expect(stored.odometerKm).toBe(45000);
    });

    it("JWT olmadan araç güncellenemez", async () => {
      const vehicle = await createTestVehicle(tenantAId!);

      await request(app.getHttpServer())
        .patch(`/tenant/vehicles/${vehicle.id}`)
        .send({ make: "Honda" })
        .expect(401);
    });

    it("Başka Tenant'ın aracını güncelleyemez", async () => {
      const vehicle = await createTestVehicle(tenantAId!);

      await request(app.getHttpServer())
        .patch(`/tenant/vehicles/${vehicle.id}`)
        .set("Authorization", `Bearer ${tenantBToken}`)
        .send({ make: "Honda" })
        .expect(404);

      const stored = await prisma.vehicle.findUniqueOrThrow({
        where: { id: vehicle.id },
      });

      expect(stored.make).toBe("Toyota");
    });

    it("Boş PATCH isteğini reddeder", async () => {
      const vehicle = await createTestVehicle(tenantAId!);

      await request(app.getHttpServer())
        .patch(`/tenant/vehicles/${vehicle.id}`)
        .set("Authorization", `Bearer ${tenantAToken}`)
        .send({})
        .expect(400);
    });

    it("Zorunlu alanın null yapılmasını reddeder", async () => {
      const vehicle = await createTestVehicle(tenantAId!);

      await request(app.getHttpServer())
        .patch(`/tenant/vehicles/${vehicle.id}`)
        .set("Authorization", `Bearer ${tenantAToken}`)
        .send({ make: null })
        .expect(400);
    });

    it("Kilometre azaltılmasını engeller", async () => {
      const vehicle = await createTestVehicle(tenantAId!);

      await request(app.getHttpServer())
        .patch(`/tenant/vehicles/${vehicle.id}`)
        .set("Authorization", `Bearer ${tenantAToken}`)
        .send({ odometerKm: 40000 })
        .expect(400);

      const stored = await prisma.vehicle.findUniqueOrThrow({
        where: { id: vehicle.id },
      });

      expect(stored.odometerKm).toBe(45000);
    });

    it("Nullable alanları null ile temizler", async () => {
      const vehicle = await createTestVehicle(tenantAId!);

      const response = await request(app.getHttpServer())
        .patch(`/tenant/vehicles/${vehicle.id}`)
        .set("Authorization", `Bearer ${tenantAToken}`)
        .send({
          color: null,
          depositAmount: null,
          hasAirConditioning: null,
        })
        .expect(200);

      expect(response.body.color).toBeNull();
      expect(response.body.depositAmount).toBeNull();
      expect(response.body.hasAirConditioning).toBeNull();

      const stored = await prisma.vehicle.findUniqueOrThrow({
        where: { id: vehicle.id },
      });

      expect(stored.color).toBeNull();
      expect(stored.depositAmount).toBeNull();
      expect(stored.hasAirConditioning).toBeNull();
    });

    it("Aynı Tenant içindeki duplicate plakayı reddeder", async () => {
      const first = await createTestVehicle(tenantAId!);
      const second = await createTestVehicle(tenantAId!);

      await request(app.getHttpServer())
        .patch(`/tenant/vehicles/${second.id}`)
        .set("Authorization", `Bearer ${tenantAToken}`)
        .send({ plate: first.plate })
        .expect(409);

      const stored = await prisma.vehicle.findUniqueOrThrow({
        where: { id: second.id },
      });

      expect(stored.plate).toBe(second.plate);
    });

    it("İstemcinin sistem alanlarını değiştirmesini reddeder", async () => {
      const vehicle = await createTestVehicle(tenantAId!);

      await request(app.getHttpServer())
        .patch(`/tenant/vehicles/${vehicle.id}`)
        .set("Authorization", `Bearer ${tenantAToken}`)
        .send({
          tenantId: tenantBId,
          fleetStatus: "INACTIVE",
        })
        .expect(400);
    });

    it("ardışık güncellemelerde kilometrenin geri düşmesini engeller", async () => {
      const vehicle = await createTestVehicle(tenantAId!);

      // Başlangıç kilometresi: 45.000

      // Birinci istek: kilometreyi 60.000'e yükselt.
      const firstResponse = await request(app.getHttpServer())
        .patch(`/tenant/vehicles/${vehicle.id}`)
        .set("Authorization", `Bearer ${tenantAToken}`)
        .send({ odometerKm: 60000 })
        .expect(200);

      expect(firstResponse.body.odometerKm).toBe(60000);

      // İkinci istek: 55.000'e düşürmeye çalış.
      await request(app.getHttpServer())
        .patch(`/tenant/vehicles/${vehicle.id}`)
        .set("Authorization", `Bearer ${tenantAToken}`)
        .send({ odometerKm: 55000 })
        .expect(400);

      // Gerçek veritabanındaki son değeri doğrula.
      const stored = await prisma.vehicle.findUniqueOrThrow({
        where: { id: vehicle.id },
      });

      expect(stored.odometerKm).toBe(60000);
    });
  });

  describe("F6 Vehicle Security E2E", () => {
    const auth = (token: string) => `Bearer ${token}`;

    it("liste, detay ve toplam sayısında Tenant izolasyonunu korur", async () => {
      const beforeA = await request(app.getHttpServer())
        .get("/tenant/vehicles")
        .set("Authorization", auth(tenantAToken))
        .expect(200);

      const beforeB = await request(app.getHttpServer())
        .get("/tenant/vehicles")
        .set("Authorization", auth(tenantBToken))
        .expect(200);

      const totalOf = (body: {
        total?: number;
        meta?: { total?: number };
        pagination?: { total?: number };
      }) => body.total ?? body.meta?.total ?? body.pagination?.total;

      const initialA = totalOf(beforeA.body);
      const initialB = totalOf(beforeB.body);

      expect(initialA).toEqual(expect.any(Number));
      expect(initialB).toEqual(expect.any(Number));

      const vehicleA1 = await createTestVehicle(tenantAId!);
      const vehicleA2 = await createTestVehicle(tenantAId!);
      const vehicleB = await createTestVehicle(tenantBId!);

      const listA = await request(app.getHttpServer())
        .get("/tenant/vehicles")
        .query({ page: 1, limit: 100 })
        .set("Authorization", auth(tenantAToken))
        .expect(200);

      const listB = await request(app.getHttpServer())
        .get("/tenant/vehicles")
        .query({ page: 1, limit: 100 })
        .set("Authorization", auth(tenantBToken))
        .expect(200);

      expect(totalOf(listA.body)).toBe(initialA! + 2);
      expect(totalOf(listB.body)).toBe(initialB! + 1);

      const idsA = listA.body.items.map((v: { id: string }) => v.id);
      const idsB = listB.body.items.map((v: { id: string }) => v.id);

      expect(idsA).toContain(vehicleA1.id);
      expect(idsA).toContain(vehicleA2.id);
      expect(idsA).not.toContain(vehicleB.id);

      expect(idsB).toContain(vehicleB.id);
      expect(idsB).not.toContain(vehicleA1.id);
      expect(idsB).not.toContain(vehicleA2.id);

      await request(app.getHttpServer())
        .get(`/tenant/vehicles/${vehicleA1.id}`)
        .set("Authorization", auth(tenantBToken))
        .expect(404);

      await request(app.getHttpServer())
        .get(`/tenant/vehicles/${vehicleB.id}`)
        .set("Authorization", auth(tenantAToken))
        .expect(404);

      const detailA = await request(app.getHttpServer())
        .get(`/tenant/vehicles/${vehicleA1.id}`)
        .set("Authorization", auth(tenantAToken))
        .expect(200);

      expect(detailA.body.id).toBe(vehicleA1.id);
      expect(detailA.body).not.toHaveProperty("tenantId");
    });

    it.each([
      { page: 0 },
      { page: -1 },
      { page: "abc" },
      { page: 1.5 },
      { limit: 0 },
      { limit: 101 },
      { limit: -5 },
      { limit: "abc" },
    ])("geçersiz pagination değerini reddeder: %j", async (query) => {
      await request(app.getHttpServer())
        .get("/tenant/vehicles")
        .set("Authorization", auth(tenantAToken))
        .query(query)
        .expect(400);
    });

    it.each([
      { category: "INVALID_CATEGORY" },
      { transmission: "INVALID_TRANSMISSION" },
      { fuelType: "INVALID_FUEL" },
      { fleetStatus: "INVALID_STATUS" },
      { sortBy: "tenantId" },
      { sortOrder: "invalid" },
    ])("geçersiz filtre veya enum değerini reddeder: %j", async (query) => {
      await request(app.getHttpServer())
        .get("/tenant/vehicles")
        .set("Authorization", auth(tenantAToken))
        .query(query)
        .expect(400);
    });

    it("geçersiz decimal fiyatı reddeder ve kaydı değiştirmez", async () => {
      const vehicle = await createTestVehicle(tenantAId!);

      await request(app.getHttpServer())
        .patch(`/tenant/vehicles/${vehicle.id}`)
        .set("Authorization", auth(tenantAToken))
        .send({ dailyPrice: "not-a-decimal" })
        .expect(400);

      const stored = await prisma.vehicle.findUniqueOrThrow({
        where: { id: vehicle.id },
      });

      expect(stored.dailyPrice.toFixed(2)).toBe("1500.00");
    });

    it("Platform Admin tokenını araç API endpointlerinde reddeder", async () => {
      const vehicle = await createTestVehicle(tenantAId!);

      await request(app.getHttpServer())
        .get("/tenant/vehicles")
        .set("Authorization", auth(platformToken))
        .expect(401);

      await request(app.getHttpServer())
        .get(`/tenant/vehicles/${vehicle.id}`)
        .set("Authorization", auth(platformToken))
        .expect(401);

      await request(app.getHttpServer())
        .patch(`/tenant/vehicles/${vehicle.id}`)
        .set("Authorization", auth(platformToken))
        .send({ make: "Honda" })
        .expect(401);

      await request(app.getHttpServer())
        .patch(`/tenant/vehicles/${vehicle.id}/status`)
        .set("Authorization", auth(platformToken))
        .send({ fleetStatus: "INACTIVE" })
        .expect(401);
    });

    it("geçersiz JWT ile araç listesine erişimi reddeder", async () => {
      await request(app.getHttpServer())
        .get("/tenant/vehicles")
        .set("Authorization", "Bearer invalid.jwt.signature")
        .expect(401);
    });

    it("silinmiş oturuma ait geçerli JWT'yi reddeder", async () => {
      const session = await prisma.tenantAdminSession.create({
        data: {
          tenantAdminId: adminAId!,
          refreshTokenHash: randomBytes(32).toString("hex"),
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      });

      const jwtService = app.get(JwtService);

      const token = await jwtService.signAsync({
        sub: adminAId,
        type: "tenant_admin",
        tenantId: tenantAId,
        sessionId: session.id,
      });

      try {
        // Oturum geçerliyken erişim başarılı.
        await request(app.getHttpServer())
          .get("/tenant/vehicles")
          .set("Authorization", auth(token))
          .expect(200);
      } finally {
        // Sadece bu testin oluşturduğu oturumu kaldır.
        await prisma.tenantAdminSession.deleteMany({
          where: { id: session.id },
        });
      }

      // JWT imzası geçerli olsa bile DB oturumu yok.
      await request(app.getHttpServer())
        .get("/tenant/vehicles")
        .set("Authorization", auth(token))
        .expect(401);
    });
  });
});
