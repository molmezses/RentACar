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
});
