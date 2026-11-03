import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { TenantApplicationsService } from './tenant-applications.service.js';
import { ListTenantApplicationsQueryDto } from './dto/list-tenant-applications-query.dto.js';

@ApiTags('Admin - Tenant Applications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/tenant-applications')
export class AdminTenantApplicationsController {
  constructor(
    private readonly tenantApplicationsService: TenantApplicationsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Şirket başvurularını listele (Super Admin)',
  })
  @ApiOkResponse({
    description: 'En yeni 50 şirket başvurusu listelendi.',
  })
  async findAll(
    @Query() query : ListTenantApplicationsQueryDto,
  ) {
    return this.tenantApplicationsService.findAllForAdmin(
      query.status,
    );
  }
}