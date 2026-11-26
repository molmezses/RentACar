import { FleetStatus, Prisma } from "../../generated/prisma/client.js";

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service.js";
import type { ListVehiclesQueryDto } from "./dto/list-vehicles-query.dto.js";
import { toTenantVehicleResponse } from "./vehicle-response.mapper.js";
import { CreateVehicleDto } from "./dto/create-vehicle.dto.js";
import { UpdateVehicleDto } from "./dto/update-vehicle.dto.js";
import { assertNonEmptyVehicleUpdate } from "./dto/update-vehicle.dto.js";

function normalizeNullableText(
  value: string | null | undefined,
): string | null | undefined {
  if (value === null || value === undefined) {
    return value;
  }

  return value.trim() || null;
}

@Injectable()
export class VehiclesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForTenant(tenantId: string, query: ListVehiclesQueryDto) {
    const {
      page,
      limit,
      search,
      category,
      fleetStatus,
      transmission,
      fuelType,
      sortBy,
      sortOrder,
    } = query;

    const skip = (page - 1) * limit;

    const normalizedSearch = search?.trim();

    const where: Prisma.VehicleWhereInput = {
      tenantId,
      ...(category ? { category } : {}),
      ...(fleetStatus ? { fleetStatus } : {}),
      ...(transmission ? { transmission } : {}),
      ...(fuelType ? { fuelType } : {}),
      ...(normalizedSearch
        ? {
            OR: [
              {
                plate: {
                  contains: normalizedSearch,
                  mode: "insensitive",
                },
              },
              {
                make: {
                  contains: normalizedSearch,
                  mode: "insensitive",
                },
              },
              {
                model: {
                  contains: normalizedSearch,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where,
        orderBy: [
          {
            [sortBy]: sortOrder,
          },
          {
            id: "asc",
          },
        ],
        skip,
        take: limit,
      }),

      this.prisma.vehicle.count({
        where,
      }),
    ]);

    return {
      items: items.map(toTenantVehicleResponse),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOneForTenant(tenantId: string, vehicleId: string) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        tenantId,
      },
    });

    if (!vehicle) {
      throw new NotFoundException("Vehicle not found");
    }

    return toTenantVehicleResponse(vehicle);
  }

  async createForTenant(tenantId: string, dto: CreateVehicleDto) {
    // Boş opsiyonel metinleri veritabanında null olarak sakla.
    const optionalText = (value?: string | null) => {
      const normalized = value?.trim();
      return normalized || null;
    };

    try {
      const vehicle = await this.prisma.vehicle.create({
        data: {
          // Tenant kimliği yalnızca doğrulanmış oturumdan gelir.
          tenantId,

          // Zorunlu alanlar
          plate: dto.plate.trim().toUpperCase(),
          make: dto.make.trim(),
          model: dto.model.trim(),
          modelYear: dto.modelYear,
          category: dto.category,
          transmission: dto.transmission,
          fuelType: dto.fuelType,
          seatCount: dto.seatCount,
          odometerKm: dto.odometerKm,
          dailyPrice: new Prisma.Decimal(dto.dailyPrice),
          currency: dto.currency,

          // Opsiyonel kimlik ve görünüm bilgileri
          vin: optionalText(dto.vin)?.toUpperCase() ?? null,
          internalCode: optionalText(dto.internalCode),
          trim: optionalText(dto.trim),
          color: optionalText(dto.color),

          // Opsiyonel teknik bilgiler
          doorCount: dto.doorCount ?? null,
          hasAirConditioning: dto.hasAirConditioning ?? null,

          // Opsiyonel operasyon bilgileri
          currentLocationLabel: optionalText(dto.currentLocationLabel),
          notes: optionalText(dto.notes),

          // Opsiyonel fiyatlandırma bilgileri
          depositAmount:
            dto.depositAmount == null
              ? null
              : new Prisma.Decimal(dto.depositAmount),

          includedMileageKm: dto.includedMileageKm ?? null,

          extraKmPrice:
            dto.extraKmPrice == null
              ? null
              : new Prisma.Decimal(dto.extraKmPrice),
        },
      });

      return toTenantVehicleResponse(vehicle);
    } catch (error: unknown) {
      // P2002: Veritabanındaki unique constraint ihlali.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException(
          "A vehicle with this identifier already exists in your fleet",
        );
      }

      // Diğer hataları NestJS'in genel hata yönetimine bırak.
      throw error;
    }
  }

  //id doğru mu ? araç bu tenanta ait mi? araç beklenen önceki durumda mı?
  async updateStatusForTenant(
    tenantId: string,
    vehicleId: string,
    fleetStatus: FleetStatus,
  ) {
    const previousStatus =
      fleetStatus === FleetStatus.ACTIVE
        ? FleetStatus.INACTIVE
        : FleetStatus.ACTIVE;

    await this.prisma.vehicle.updateMany({
      where: {
        id: vehicleId,
        tenantId,
        fleetStatus: previousStatus,
      },
      data: {
        fleetStatus,
        deactivatedAt: fleetStatus === FleetStatus.INACTIVE ? new Date() : null,
      },
    });

    const vehicle = await this.prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        tenantId,
      },
    });

    if (!vehicle) {
      throw new NotFoundException("Vehicle not found");
    }

    return toTenantVehicleResponse(vehicle);
  }

  async updateForTenant(
    tenantId: string,
    vehicleId: string,
    dto: UpdateVehicleDto,
  ) {
    // 1. En az bir alan gönderilmiş olmalı.
    assertNonEmptyVehicleUpdate(dto);

    // 2. Araç yalnızca giriş yapan Tenant kapsamında aranır.
    const existingVehicle = await this.prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        tenantId,
      },
    });

    // 3. Araç yoksa veya başka Tenant'a aitse aynı hata döner.
    if (!existingVehicle) {
      throw new NotFoundException("Vehicle not found");
    }

    if (
      dto.odometerKm !== undefined &&
      dto.odometerKm < existingVehicle.odometerKm
    ) {
      throw new BadRequestException("Vehicle odometer cannot be decreased.");
    }

    const data: Prisma.VehicleUpdateManyMutationInput = {
      // Araç kimliği
      ...(dto.plate !== undefined
        ? { plate: dto.plate.trim().toUpperCase() }
        : {}),

      ...(dto.make !== undefined ? { make: dto.make.trim() } : {}),

      ...(dto.model !== undefined ? { model: dto.model.trim() } : {}),

      ...(dto.modelYear !== undefined ? { modelYear: dto.modelYear } : {}),

      ...(dto.category !== undefined ? { category: dto.category } : {}),

      // Teknik bilgiler
      ...(dto.transmission !== undefined
        ? { transmission: dto.transmission }
        : {}),

      ...(dto.fuelType !== undefined ? { fuelType: dto.fuelType } : {}),

      ...(dto.seatCount !== undefined ? { seatCount: dto.seatCount } : {}),

      ...(dto.odometerKm !== undefined ? { odometerKm: dto.odometerKm } : {}),

      // Fiyatlandırma
      ...(dto.dailyPrice !== undefined
        ? { dailyPrice: new Prisma.Decimal(dto.dailyPrice) }
        : {}),

      ...(dto.currency !== undefined ? { currency: dto.currency } : {}),

      // Opsiyonel araç bilgileri
      ...(dto.vin !== undefined ? { vin: normalizeNullableText(dto.vin) } : {}),

      ...(dto.color !== undefined
        ? { color: normalizeNullableText(dto.color) }
        : {}),

      ...(dto.notes !== undefined
        ? { notes: normalizeNullableText(dto.notes) }
        : {}),

      ...(dto.internalCode !== undefined
        ? { internalCode: normalizeNullableText(dto.internalCode) }
        : {}),

      ...(dto.trim !== undefined
        ? { trim: normalizeNullableText(dto.trim) }
        : {}),

      ...(dto.currentLocationLabel !== undefined
        ? {
            currentLocationLabel: normalizeNullableText(
              dto.currentLocationLabel,
            ),
          }
        : {}),

      // Opsiyonel sayısal bilgiler
      ...(dto.doorCount !== undefined ? { doorCount: dto.doorCount } : {}),

      ...(dto.includedMileageKm !== undefined
        ? { includedMileageKm: dto.includedMileageKm }
        : {}),

      // Klima bilgisi
      ...(dto.hasAirConditioning !== undefined
        ? { hasAirConditioning: dto.hasAirConditioning }
        : {}),

      // Depozito tutarı
      ...(dto.depositAmount !== undefined
        ? {
            depositAmount:
              dto.depositAmount === null
                ? null
                : new Prisma.Decimal(dto.depositAmount),
          }
        : {}),

      // Ek kilometre ücreti
      ...(dto.extraKmPrice !== undefined
        ? {
            extraKmPrice:
              dto.extraKmPrice === null
                ? null
                : new Prisma.Decimal(dto.extraKmPrice),
          }
        : {}),
    };

    let result: Prisma.BatchPayload;

    try {
      result = await this.prisma.vehicle.updateMany({
        where: {
          id: vehicleId,
          tenantId,
          ...(dto.odometerKm !== undefined
            ? { odometerKm: { lte: dto.odometerKm } }
            : {}),
        },
        data,
      });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException(
          "A vehicle with the same unique information already exists.",
        );
      }

      throw error;
    }

    if (result.count === 0) {
      const currentVehicle = await this.prisma.vehicle.findFirst({
        where: {
          id: vehicleId,
          tenantId,
        },
      });

      if (!currentVehicle) {
        throw new NotFoundException("Vehicle not found");
      }

      throw new ConflictException(
        "Vehicle could not be updated because its data has changed.",
      );
    }

    const updatedVehicle = await this.prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        tenantId,
      },
    });

    if (!updatedVehicle) {
      throw new NotFoundException("Vehicle not found");
    }

    return toTenantVehicleResponse(updatedVehicle);
  }
}
