import { beforeEach, describe, expect, it, vi } from "vitest";
import { UnauthorizedException } from "@nestjs/common";

import { VehiclesController } from "./vehicles.controller.js";
import { VehiclesService } from "./vehicles.service.js";
import type { TenantAuthenticatedRequest } from "../auth/guards/tenant-jwt-auth.guard.js";
import { ListVehiclesQueryDto } from "./dto/list-vehicles-query.dto.js";
import { CreateVehicleDto } from "./dto/create-vehicle.dto.js";
import { UpdateVehicleDto } from "./dto/update-vehicle.dto.js";

vi.mock("../auth/tenant-auth-context.js", () => ({
  getTenantAuthContext: vi.fn((request) => {
    if (!request.tenantAuth) {
      throw new UnauthorizedException();
    }

    return request.tenantAuth;
  }),
}));

describe("VehiclesController", () => {
  const findAllForTenant = vi.fn();
  const findOneForTenant = vi.fn();
  const createForTenant = vi.fn();
  const updateStatusForTenant = vi.fn();
  const updateForTenant = vi.fn();

  const service = {
    findAllForTenant,
    findOneForTenant,
    createForTenant,
    updateStatusForTenant,
    updateForTenant, // F5
  } as unknown as VehiclesService;

  const controller = new VehiclesController(service);

  const createRequest = (tenantId = "tenant_a") =>
    ({
      tenantAuth: {
        tenantId,
      },
    }) as unknown as TenantAuthenticatedRequest;

  beforeEach(() => {
    vi.resetAllMocks();

    // F3 — Araç listeleme
    findAllForTenant.mockResolvedValue({
      items: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    });

    // F3 — Araç detayı
    findOneForTenant.mockResolvedValue({
      id: "vehicle_1",
      plate: "34 ABC 123",
    });

    // F4 — Araç oluşturma
    createForTenant.mockResolvedValue({
      id: "vehicle_1",
      plate: "38 ABC 123",
      dailyPrice: "1500.00",
      fleetStatus: "ACTIVE",
    });

    // G4 — Aktif/pasif durum güncelleme
    updateStatusForTenant.mockResolvedValue({
      id: "vehicle_1",
      fleetStatus: "INACTIVE",
      deactivatedAt: "2026-11-25T17:00:00.000Z",
    });
  });

  it("listeleme için oturumdaki tenantId değerini kullanır", async () => {
    const request = createRequest("tenant_a");
    const query = new ListVehiclesQueryDto();

    await controller.findAll(request, query);

    expect(findAllForTenant).toHaveBeenCalledWith("tenant_a", query);
  });

  it("arama ve filtreleme parametrelerini Service’e aktarır", async () => {
    const request = createRequest("tenant_b");
    const query = Object.assign(new ListVehiclesQueryDto(), {
      page: 2,
      limit: 10,
      search: "Toyota",
      category: "SEDAN",
      sortBy: "dailyPrice",
      sortOrder: "asc",
    });

    await controller.findAll(request, query);

    expect(findAllForTenant).toHaveBeenCalledWith("tenant_b", query);
  });

  it("araç detayında tenantId ve vehicleId gönderir", async () => {
    const request = createRequest("tenant_a");

    await controller.findOne(request, "vehicle_1");

    expect(findOneForTenant).toHaveBeenCalledWith("tenant_a", "vehicle_1");
  });

  it("Service sonucunu değiştirmeden döndürür", async () => {
    const request = createRequest();
    const query = new ListVehiclesQueryDto();

    const result = await controller.findAll(request, query);

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

  it("Tenant oturum bilgisi yoksa isteği reddeder", async () => {
    const request = {} as TenantAuthenticatedRequest;

    await expect(
      controller.findAll(request, new ListVehiclesQueryDto()),
    ).rejects.toThrow(UnauthorizedException);

    expect(findAllForTenant).not.toHaveBeenCalled();
  });

  describe("POST /tenant/vehicles", () => {
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

    it("doğrulanmış tenantId ve DTO ile Service çağırır", async () => {
      const request = createRequest("tenant_a");
      const dto = validDto();

      await controller.create(request, dto);

      expect(createForTenant).toHaveBeenCalledWith("tenant_a", dto);
    });

    it("farklı Tenant oturumunun kimliğini doğru aktarır", async () => {
      const request = createRequest("tenant_b");
      const dto = validDto();

      await controller.create(request, dto);

      expect(createForTenant).toHaveBeenCalledWith("tenant_b", dto);
    });

    it("Service tarafından oluşturulan araç yanıtını döndürür", async () => {
      const result = await controller.create(
        createRequest("tenant_a"),
        validDto(),
      );

      expect(result).toEqual({
        id: "vehicle_1",
        plate: "38 ABC 123",
        dailyPrice: "1500.00",
        fleetStatus: "ACTIVE",
      });
    });

    it("Tenant oturumu bulunmadığında kayıt oluşturmaz", async () => {
      const request = {} as TenantAuthenticatedRequest;

      await expect(controller.create(request, validDto())).rejects.toThrow(
        UnauthorizedException,
      );

      expect(createForTenant).not.toHaveBeenCalled();
    });
  });

  it("durum güncellemede tenantId değerini oturumdan alır", async () => {
    const request = createRequest("tenant_a");

    const body = {
      fleetStatus: "INACTIVE" as const,
    };

    await controller.updateStatus(request, "vehicle_1", body);

    expect(updateStatusForTenant).toHaveBeenCalledWith(
      "tenant_a",
      "vehicle_1",
      "INACTIVE",
    );
  });

  it("durum güncelleme sonucunu değiştirmeden döndürür", async () => {
    const request = createRequest("tenant_a");

    const body = {
      fleetStatus: "INACTIVE" as const,
    };

    const result = await controller.updateStatus(request, "vehicle_1", body);

    expect(result).toEqual({
      id: "vehicle_1",
      fleetStatus: "INACTIVE",
      deactivatedAt: "2026-11-25T17:00:00.000Z",
    });
  });

  it("durum güncellemede Tenant oturumu yoksa isteği reddeder", async () => {
    const request = {} as TenantAuthenticatedRequest;

    await expect(
      controller.updateStatus(request, "vehicle_1", {
        fleetStatus: "INACTIVE",
      }),
    ).rejects.toThrow(UnauthorizedException);

    expect(updateStatusForTenant).not.toHaveBeenCalled();
  });

  describe("PATCH /tenant/vehicles/:id", () => {
    it("doğrulanmış Tenant kimliğiyle güncelleme yapar", async () => {
      const request = createRequest("tenant_a");

      const dto = Object.assign(new UpdateVehicleDto(), {
        make: "Honda",
      });

      const updatedVehicle = {
        id: "vehicle_1",
        make: "Honda",
      };

      updateForTenant.mockResolvedValue(updatedVehicle);

      const result = await controller.update(request, "vehicle_1", dto);

      expect(updateForTenant).toHaveBeenCalledWith(
        "tenant_a",
        "vehicle_1",
        dto,
      );

      expect(result).toEqual(updatedVehicle);
    });

    it("farklı Tenant oturumunun kimliğini doğru aktarır", async () => {
      const request = createRequest("tenant_b");

      const dto = Object.assign(new UpdateVehicleDto(), {
        model: "Civic",
      });

      updateForTenant.mockResolvedValue({
        id: "vehicle_1",
        model: "Civic",
      });

      await controller.update(request, "vehicle_1", dto);

      expect(updateForTenant).toHaveBeenCalledWith(
        "tenant_b",
        "vehicle_1",
        dto,
      );
    });

    it("Tenant oturumu yoksa güncelleme yapmaz", async () => {
      const request = {} as TenantAuthenticatedRequest;

      const dto = Object.assign(new UpdateVehicleDto(), {
        make: "Honda",
      });

      await expect(
        controller.update(request, "vehicle_1", dto),
      ).rejects.toThrow(UnauthorizedException);

      expect(updateForTenant).not.toHaveBeenCalled();
    });
  });
});
