import { FleetStatus, type Prisma } from '../../generated/prisma/client.js';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { ListVehiclesQueryDto } from './dto/list-vehicles-query.dto.js';
import { toTenantVehicleResponse } from './vehicle-response.mapper.js';

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
                  mode: 'insensitive',
                },
              },
              {
                make: {
                  contains: normalizedSearch,
                  mode: 'insensitive',
                },
              },
              {
                model: {
                  contains: normalizedSearch,
                  mode: 'insensitive',
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
            id: 'asc',
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
      throw new NotFoundException('Vehicle not found');
    }

    return toTenantVehicleResponse(vehicle);
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
        deactivatedAt:
          fleetStatus === FleetStatus.INACTIVE
            ? new Date()
            : null,
      },
    });

    const vehicle = await this.prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        tenantId,
      },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return toTenantVehicleResponse(vehicle);
  }
}
