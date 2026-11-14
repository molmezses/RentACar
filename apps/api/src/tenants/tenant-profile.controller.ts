import { Controller, Get, Req, UseGuards } from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import {
  TenantJwtAuthGuard,
  type TenantAuthenticatedRequest,
} from '../auth/guards/tenant-jwt-auth.guard.js';

import { TenantsService } from './tenants.service.js';

import { getTenantAuthContext } from '../auth/tenant-auth-context.js';

@ApiTags('Tenant Profile')
@ApiBearerAuth()
@UseGuards(TenantJwtAuthGuard)
@Controller('tenant/profile')
export class TenantProfileController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  @ApiOperation({
    summary: 'Giriş yapan yöneticinin şirket bilgileri',
  })
  @ApiResponse({
    status: 200,
    description: 'Şirket bilgileri başarıyla getirildi.',
  })
  @ApiResponse({
    status: 401,
    description: 'Geçersiz veya süresi dolmuş tenant oturumu.',
  })
  async getProfile(@Req() request: TenantAuthenticatedRequest) {
    const auth = getTenantAuthContext(request);

    return this.tenantsService.findByIdForTenant(auth.tenantId);
  }
}
