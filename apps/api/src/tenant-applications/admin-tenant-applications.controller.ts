import {
  Controller,
  Get,
  Query,
  UseGuards,
  Patch,
  Param
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
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
      query.status
    );
  }

  @Patch(':id/approve')
@ApiOperation({
  summary: 'Şirket başvurusunu onayla (Super Admin)',
})
@ApiParam({
  name: 'id',
  description: 'Onaylanacak şirket başvurusunun ID değeri',
  type: String,
})
@ApiOkResponse({
  description: 'Başvuru onaylandı ve Tenant oluşturuldu.',
})
@ApiUnauthorizedResponse({
  description: 'Geçersiz veya eksik JWT.',
})
@ApiNotFoundResponse({
  description: 'Şirket başvurusu bulunamadı.',
})
@ApiConflictResponse({
  description: 'Başvuru daha önce işlenmiş veya slug kullanılıyor.',
})
async approve(@Param('id') id: string) {
  return this.tenantApplicationsService.approveApplication(id);
}
}