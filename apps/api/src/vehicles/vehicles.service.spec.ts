import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "../../generated/prisma/client.js";

import { VehiclesService } from "./vehicles.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { ListVehiclesQueryDto } from "./dto/list-vehicles-query.dto.js";

import { ConflictException, NotFoundException } from "@nestjs/common";
import { CreateVehicleDto } from "./dto/create-vehicle.dto.js";

describe("VehiclesService", () => {
  const findMany = vi.fn();
  const count = vi.fn();
  const findFirst = vi.fn();
  const create = vi.fn();

  const prisma = {
    vehicle: {
      findMany,
      count,
      findFirst,
      create,
    },
  } as unknown as PrismaService;

  const service = new VehiclesService(prisma);

  const createQuery = (
    overrides: Partial<ListVehiclesQueryDto> = {},
  ): ListVehiclesQueryDto =>
    Object.assign(new ListVehiclesQueryDto(), overrides);

  const createVehicle = (tenantId = "tenant_a") => ({
    id: "vehicle_1",
    tenantId,
    plate: "34 ABC 123",
    make: "Toyota",
    model: "Corolla",
    modelYear: 2024,
    category: "SEDAN" as const,
    transmission: "AUTOMATIC" as const,
    fuelType: "HYBRID" as const,
    seatCount: 5,
    odometerKm: 45000,
    dailyPrice: new Prisma.Decimal("1500.00"),
    currency: "TRY" as const,
    depositAmount: null,
    includedMileageKm: null,
    extraKmPrice: null,
    fleetStatus: "ACTIVE" as const,
    color: null,
    vin: null,
    internalCode: null,
    trim: null,
    doorCount: null,
    currentLocationLabel: null,
    notes: null,
    hasAirConditioning: null,
    createdAt: new Date("2026-11-20T10:00:00.000Z"),
    updatedAt: new Date("2026-11-20T10:00:00.000Z"),
  });

  beforeEach(() => {
    vi.resetAllMocks();
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);
    findFirst.mockResolvedValue(null);
    create.mockResolvedValue(createVehicle());
  });

  describe("findAllForTenant", () => {
    it("varsayılan pagination değerlerini kullanır", async () => {
      const result = await service.findAllForTenant("tenant_a", createQuery());

      expect(findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: "tenant_a" },
          skip: 0,
          take: 20,
          orderBy: [{ createdAt: "desc" }, { id: "asc" }],
        }),
      );

      expect(result).toEqual({
        items: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      });
    });

    it("ikinci sayfa için doğru skip değerini hesaplar", async () => {
      await service.findAllForTenant(
        "tenant_a",
        createQuery({ page: 2, limit: 10 }),
      );

      expect(findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
    });

    it("toplam sayfa sayısını hesaplar", async () => {
      count.mockResolvedValue(45);

      const result = await service.findAllForTenant("tenant_a", createQuery());

      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 45,
        totalPages: 3,
      });
    });

    it("arama koşulunu plaka, marka ve modele uygular", async () => {
      await service.findAllForTenant(
        "tenant_a",
        createQuery({ search: " Toyota " }),
      );

      const args = findMany.mock.calls[0][0];

      expect(args.where.tenantId).toBe("tenant_a");
      expect(args.where.OR).toEqual([
        {
          plate: {
            contains: "Toyota",
            mode: "insensitive",
          },
        },
        {
          make: {
            contains: "Toyota",
            mode: "insensitive",
          },
        },
        {
          model: {
            contains: "Toyota",
            mode: "insensitive",
          },
        },
      ]);
    });

    it("boş aramada OR koşulu eklemez", async () => {
      await service.findAllForTenant(
        "tenant_a",
        createQuery({ search: "   " }),
      );

      expect(findMany.mock.calls[0][0].where).toEqual({
        tenantId: "tenant_a",
      });
    });

    it("dört araç filtresini birlikte uygular", async () => {
      await service.findAllForTenant(
        "tenant_a",
        createQuery({
          category: "SUV",
          fleetStatus: "ACTIVE",
          transmission: "AUTOMATIC",
          fuelType: "DIESEL",
        }),
      );

      expect(findMany.mock.calls[0][0].where).toEqual({
        tenantId: "tenant_a",
        category: "SUV",
        fleetStatus: "ACTIVE",
        transmission: "AUTOMATIC",
        fuelType: "DIESEL",
      });
    });

    it("arama ve filtreleme birlikte çalışır", async () => {
      await service.findAllForTenant(
        "tenant_a",
        createQuery({
          search: "BMW",
          category: "SUV",
        }),
      );

      const where = findMany.mock.calls[0][0].where;

      expect(where.tenantId).toBe("tenant_a");
      expect(where.category).toBe("SUV");
      expect(where.OR).toHaveLength(3);
    });

    it("dinamik sıralama uygular", async () => {
      await service.findAllForTenant(
        "tenant_a",
        createQuery({
          sortBy: "dailyPrice",
          sortOrder: "asc",
        }),
      );

      expect(findMany.mock.calls[0][0].orderBy).toEqual([
        { dailyPrice: "asc" },
        { id: "asc" },
      ]);
    });

    it("findMany ve count aynı filtreleri kullanır", async () => {
      await service.findAllForTenant(
        "tenant_a",
        createQuery({
          search: "Toyota",
          fleetStatus: "ACTIVE",
        }),
      );

      expect(findMany.mock.calls[0][0].where).toEqual(
        count.mock.calls[0][0].where,
      );
    });

    it("Tenant izolasyonunu sorguda uygular", async () => {
      await service.findAllForTenant(
        "tenant_b",
        createQuery({ search: "Toyota" }),
      );

      expect(findMany.mock.calls[0][0].where.tenantId).toBe("tenant_b");

      expect(count.mock.calls[0][0].where.tenantId).toBe("tenant_b");
    });

    it("liste yanıtını mapper ile dönüştürür", async () => {
      findMany.mockResolvedValue([createVehicle()]);
      count.mockResolvedValue(1);

      const result = await service.findAllForTenant("tenant_a", createQuery());

      expect(result.items).toHaveLength(1);
      expect(result.items[0]).not.toHaveProperty("tenantId");
      expect(result.items[0].dailyPrice).toBe("1500.00");
      expect(result.pagination.total).toBe(1);
    });
  });

  describe("findOneForTenant", () => {
    it("araç detayını tenantId ve araç ID ile sorgular", async () => {
      findFirst.mockResolvedValue(createVehicle());

      const result = await service.findOneForTenant("tenant_a", "vehicle_1");

      expect(findFirst).toHaveBeenCalledWith({
        where: {
          id: "vehicle_1",
          tenantId: "tenant_a",
        },
      });

      expect(result.id).toBe("vehicle_1");
      expect(result).not.toHaveProperty("tenantId");
      expect(result.dailyPrice).toBe("1500.00");
    });

    it("araç bulunamadığında 404 hatası fırlatır", async () => {
      await expect(
        service.findOneForTenant("tenant_a", "unknown_vehicle"),
      ).rejects.toThrow(NotFoundException);
    });

    it("başka Tenant aracına erişim için 404 davranışını korur", async () => {
      // Prisma mock'u tenantId koşuluna eşleşen kayıt bulamadığını simüle eder.
      findFirst.mockResolvedValue(null);

      await expect(
        service.findOneForTenant("tenant_a", "vehicle_of_tenant_b"),
      ).rejects.toThrow("Vehicle not found");

      expect(findFirst.mock.calls[0][0].where).toEqual({
        id: "vehicle_of_tenant_b",
        tenantId: "tenant_a",
      });
    });
  });

  describe("createForTenant", () => {
    const validDto = (): CreateVehicleDto =>
      Object.assign(new CreateVehicleDto(), {
        plate: "38 ABC 123",
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
      });

    it("aracı doğrulanmış Tenant kimliğiyle oluşturur", async () => {
      await service.createForTenant("tenant_a", validDto());

      expect(create).toHaveBeenCalledOnce();

      expect(create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tenantId: "tenant_a",
          plate: "38 ABC 123",
          make: "Toyota",
          model: "Corolla",
        }),
      });
    });

    it("plakayı normalize ederek kaydeder", async () => {
      const dto = validDto();
      dto.plate = " 38 abc 123 ";

      await service.createForTenant("tenant_a", dto);

      expect(create.mock.calls[0][0].data.plate).toBe("38 ABC 123");
    });

    it("fiyatları Prisma Decimal olarak kaydeder", async () => {
      const dto = validDto();

      dto.depositAmount = "3000.00";
      dto.extraKmPrice = "12.50";

      await service.createForTenant("tenant_a", dto);

      const data = create.mock.calls[0][0].data;

      expect(data.dailyPrice).toBeInstanceOf(Prisma.Decimal);
      expect(data.dailyPrice.toFixed(2)).toBe("1500.00");

      expect(data.depositAmount).toBeInstanceOf(Prisma.Decimal);
      expect(data.depositAmount.toFixed(2)).toBe("3000.00");

      expect(data.extraKmPrice.toFixed(2)).toBe("12.50");
    });

    it("boş opsiyonel metinleri null olarak kaydeder", async () => {
      const dto = validDto();

      dto.color = "   ";
      dto.vin = "";
      dto.internalCode = "";

      await service.createForTenant("tenant_a", dto);

      const data = create.mock.calls[0][0].data;

      expect(data.color).toBeNull();
      expect(data.vin).toBeNull();
      expect(data.internalCode).toBeNull();
    });

    it("hasAirConditioning false değerini korur", async () => {
      const dto = validDto();
      dto.hasAirConditioning = false;

      await service.createForTenant("tenant_a", dto);

      expect(create.mock.calls[0][0].data.hasAirConditioning).toBe(false);
    });

    it("istemciye ait olmayan sistem alanlarını Prisma verisine eklemez", async () => {
      await service.createForTenant("tenant_a", validDto());

      const data = create.mock.calls[0][0].data;

      expect(data).not.toHaveProperty("id");
      expect(data).not.toHaveProperty("fleetStatus");
      expect(data).not.toHaveProperty("createdAt");
      expect(data).not.toHaveProperty("updatedAt");
    });

    it("oluşturulan araç yanıtında tenantId göstermez", async () => {
      const result = await service.createForTenant("tenant_a", validDto());

      expect(result.id).toBe("vehicle_1");
      expect(result).not.toHaveProperty("tenantId");
      expect(result.dailyPrice).toBe("1500.00");
    });

    it("Prisma P2002 hatasını 409 Conflict hatasına dönüştürür", async () => {
      const duplicateError = new Prisma.PrismaClientKnownRequestError(
        "Unique constraint failed",
        {
          code: "P2002",
          clientVersion: "7.10.1",
        },
      );

      create.mockRejectedValue(duplicateError);

      await expect(
        service.createForTenant("tenant_a", validDto()),
      ).rejects.toThrow(ConflictException);
    });

    it("duplicate hatasında ham Prisma mesajını kullanıcıya göstermez", async () => {
      const duplicateError = new Prisma.PrismaClientKnownRequestError(
        "Sensitive database details",
        {
          code: "P2002",
          clientVersion: "7.10.1",
        },
      );

      create.mockRejectedValue(duplicateError);

      try {
        await service.createForTenant("tenant_a", validDto());
        expect.fail("ConflictException bekleniyordu");
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);

        const message = (error as ConflictException).message;

        expect(message).not.toContain("Sensitive database details");
      }
    });
  });
});
