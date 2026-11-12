import {
  Controller,
  Get,
  Query,
  UseGuards,
  Patch,
  Param,
  Delete,
  HttpCode,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiNoContentResponse,
  ApiForbiddenResponse,
  getSchemaPath,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { TenantApplicationsService } from './tenant-applications.service.js';
import { ListTenantApplicationsQueryDto } from './dto/list-tenant-applications-query.dto.js';
import { TenantApplicationResponseDto } from './dto/tenant-application-response.dto.js';
import { ApproveTenantApplicationResponseDto } from './dto/approve-tenant-application-response.dto.js';
import { TenantResponseDto } from './dto/tenant-response.dto.js';

@ApiTags('Admin - Tenant Applications')
@ApiBearerAuth()
@ApiExtraModels(
  ApproveTenantApplicationResponseDto,
  TenantApplicationResponseDto,
  TenantResponseDto,
)
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
    type: TenantApplicationResponseDto,
    isArray: true,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired Super Admin JWT.',
  })
  @ApiBadRequestResponse({
    description:
      'Geçersiz status filtresi. PENDING, APPROVED veya REJECTED kullanılmalıdır.',
  })
  async findAll(@Query() query: ListTenantApplicationsQueryDto) {
    return this.tenantApplicationsService.findAllForAdmin(query.status);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a tenant application by ID (Super Admin)',
    description:
      'Retrieves the details of a single tenant application. Requires Super Admin authentication',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the tenant application.',
    type: String,
  })
  @ApiOkResponse({
    description: 'Tenant application retrieved successfully.',
    type: TenantApplicationResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired Super Admin JWT.',
  })
  @ApiNotFoundResponse({
    description: 'Tenant application not found.',
  })
  async findOne(@Param('id') id: string) {
    return this.tenantApplicationsService.findOneForAdmin(id);
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
    schema: {
      allOf: [
        {
          $ref: getSchemaPath(ApproveTenantApplicationResponseDto),
        },
      ],
      example: {
        application: {
          id: 'application-123',
          companyName: 'Eda RentACar',
          slug: 'eda-rentacar',
          contactName: 'Eda Demir',
          contactEmail: 'eda@example.com',
          contactPhone: '+905321234567',
          status: 'APPROVED',
          tenantId: 'tenant-456',
          createdAt: '2026-11-05T10:00:00.000Z',
          updatedAt: '2026-11-05T10:05:00.000Z',
        },
        tenant: {
          id: 'tenant-456',
          name: 'Eda RentACar',
          slug: 'eda-rentacar',
          status: 'APPROVED',
          createdAt: '2026-11-05T10:05:00.000Z',
          updatedAt: '2026-11-05T10:05:00.000Z',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Geçersi veya eksik JWT.',
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

  @Patch(':id/reject')
  @ApiOperation({
    summary: 'Şirket başvurusunu reddet (Super Admin)',
    description:
      'Yalnızca PENDING durumundaki başvuruları reddeder. Tenant oluşturmaz.',
  })
  @ApiParam({
    name: 'id',
    description: 'Reddedilecek şirket başvurusunun ID değeri',
    type: String,
  })
  @ApiOkResponse({
    description: 'Şirket başvurusu başarıyla reddedildi.',
    schema: {
      allOf: [
        {
          $ref: getSchemaPath(TenantApplicationResponseDto),
        },
      ],
      example: {
        id: 'cm1234567890abcdef',
        companyName: 'Eda RentACar',
        slug: 'eda-rentacar',
        contactName: 'Eda Demir',
        contactEmail: 'eda@example.com',
        contactPhone: '+905321234567',
        status: 'REJECTED',
        tenantId: null,
        createdAt: '2026-11-05T10:00:00.000Z',
        updatedAt: '2026-11-05T10:00:00.000Z',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Geçersiz veya eksik Super Admin JWT.',
  })
  @ApiNotFoundResponse({
    description: 'Şirket başvurusu bulunamadı.',
  })
  @ApiConflictResponse({
    description: 'Başvuru daha önce işleme alınmış.',
  })
  async reject(@Param('id') id: string) {
    return this.tenantApplicationsService.rejectApplication(id);
  }
  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ //endpointe başlık ve açıklama ekler
    summary:'Delete an eligible tenant applicaiton (Platform Admin)',
    description: 'Permanently deletes only PENDING OR REJECTED applications without a linked tenant. ',
  })
  @ApiParam({ //silinecek başvurunun idsini alır
    name:'id',
    description: 'ID of the tenant application to delete',
    type:String,
  })
  @ApiNoContentResponse({ //silme başarılı
    description:'Tenant application deleted successfully.',
  })
  @ApiUnauthorizedResponse({//token eksik,geçersiz
    description: 'Missing , invalid, or expired Platform Admin JWT.',
  })
  @ApiForbiddenResponse({
    description:'Authenticated user does not have Platform Admin permission.',
  })
  @ApiNotFoundResponse({ //başvuru bulunamadı
    description:'Tenant applicaiton not found.',
  })
  @ApiConflictResponse({ //başvuru onaylanmış / tenanta bağlı
    description: 'Application is approved, tenant-linked, or cannot be deleted.',
  })
  async remove(@Param('id') id:string):Promise<void>{
    await this.tenantApplicationsService.deleteApplication(id);
  }
}