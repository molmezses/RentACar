import { Body, Controller, Post } from '@nestjs/common';
import { TenantApplicationsService } from './tenant-applications.service.js';
import { CreateTenantApplicationDto } from './dto/create-tenant-application.dto.js';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Tenant Applications')
@Controller('tenant-applications')
export class TenantApplicationsController {
  constructor(
    private readonly tenantApplicationsService: TenantApplicationsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Submit a new tenant application',
  })
  @ApiResponse({
    status: 201,
    description: 'Tenant application submitted successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid application data.',
  })
  create(@Body() createTenantApplicationDto: CreateTenantApplicationDto) {
    return this.tenantApplicationsService.create(createTenantApplicationDto);
  }
}