import { Prisma } from "../../generated/prisma/client.js";
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import type { ListVehiclesQueryDto } from "./dto/list-vehicles-query.dto.js";
import { toTenantVehicleResponse } from "./vehicle-response.mapper.js";
import { CreateVehicleDto } from "./dto/create-vehicle.dto.js";

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
}
