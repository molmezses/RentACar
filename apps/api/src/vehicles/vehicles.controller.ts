import { Controller, Get, Param, Query, Post, Body, Patch, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import {
  TenantJwtAuthGuard,
  type TenantAuthenticatedRequest,
} from "../auth/guards/tenant-jwt-auth.guard.js";

import { getTenantAuthContext } from "../auth/tenant-auth-context.js";
import { VehiclesService } from "./vehicles.service.js";

import { ListVehiclesQueryDto } from "./dto/list-vehicles-query.dto.js";

import { VehicleListResponseDto } from "./dto/vehicle-list-response.dto.js";
import { TenantVehicleResponseDto } from "./dto/tenant-vehicle-response.dto.js";

import { CreateVehicleDto } from "./dto/create-vehicle.dto.js";
import { UpdateVehicleStatusDto } from './dto/update-vehicle-status.dto.js';

@ApiTags("Tenant Vehicles")
@ApiBearerAuth()
@UseGuards(TenantJwtAuthGuard)
@Controller("tenant/vehicles")
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get()
  @ApiOperation({
    summary: "Şirkete ait araçları listele",
    description:
      "Giriş yapan Tenant Admin kullanıcısının şirketine ait araçları " +
      "sayfalama, arama, filtreleme ve sıralama seçenekleriyle getirir.",
  })
  @ApiResponse({
    status: 200,
    description: "Araç listesi ve pagination bilgileri başarıyla getirildi.",
    type: VehicleListResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Geçersiz sorgu parametreleri.",
  })
  @ApiResponse({
    status: 401,
    description: "Geçersiz veya eksik Tenant Admin oturumu.",
  })
  async findAll(
    @Req() request: TenantAuthenticatedRequest,
    @Query() query: ListVehiclesQueryDto,
  ) {
    const auth = getTenantAuthContext(request);

    return this.vehiclesService.findAllForTenant(auth.tenantId, query);
  }

  @Get(":id")
  @ApiOperation({
    summary: "Şirkete ait araç detayını getir",
    description:
      "Yalnızca giriş yapan şirkete ait araçların detaylarını getirir. " +
      "Araç bulunamazsa veya başka bir şirkete aitse 404 döner.",
  })
  @ApiResponse({
    status: 200,
    description: "Araç detayları başarıyla getirildi.",
    type: TenantVehicleResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: "Geçersiz veya eksik Tenant Admin oturumu.",
  })
  @ApiResponse({
    status: 404,
    description: "Araç bulunamadı veya bu şirkete ait değil.",
  })
  async findOne(
    @Req() request: TenantAuthenticatedRequest,
    @Param("id") vehicleId: string,
  ) {
    const auth = getTenantAuthContext(request);

    return this.vehiclesService.findOneForTenant(auth.tenantId, vehicleId);
  }

  
@Patch(':id/status')
@ApiOperation({
  summary: 'Tenant aracının aktif/pasif durumunu günceller',
})
@ApiResponse({
  status: 200,
  description: 'Araç durumu başarıyla güncellendi.',
  type: TenantVehicleResponseDto,
})
@ApiResponse({
  status: 400,
  description: 'Geçersiz araç durumu veya istek gövdesi.',
})
@ApiResponse({
  status: 401,
  description: 'Kimlik doğrulama gerekli.',
})
@ApiResponse({
  status: 404,
  description: 'Araç bulunamadı.',
})
async updateStatus(
  @Req() request: TenantAuthenticatedRequest,
  @Param('id') vehicleId: string,
  @Body() body: UpdateVehicleStatusDto,
) {
  const auth = getTenantAuthContext(request);

  return this.vehiclesService.updateStatusForTenant(
    auth.tenantId,
    vehicleId,
    body.fleetStatus,
  );
}

  @Post()
  @ApiOperation({
    summary: "Create a vehicle for the authenticated tenant",
  })
  @ApiResponse({
    status: 201,
    description: "Vehicle created successfully",
    type: TenantVehicleResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Invalid vehicle data",
  })
  @ApiResponse({
    status: 401,
    description: "Missing or invalid Tenant Admin session",
  })
  @ApiResponse({
    status: 409,
    description: "Vehicle identifier already exists in this tenant",
  })
  async create(
    @Req() request: TenantAuthenticatedRequest,
    @Body() dto: CreateVehicleDto,
  ) {
    const auth = getTenantAuthContext(request);

    return this.vehiclesService.createForTenant(auth.tenantId, dto);
  }
}
