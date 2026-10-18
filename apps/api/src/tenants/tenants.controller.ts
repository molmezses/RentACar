import { Body, Controller, Get, Post } from '@nestjs/common';
import { TenantsService } from './tenants.service.js';
import { CreateTenantDto } from './dto/create-tenant.dto.js';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';

@ApiTags('Tenants')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  @ApiOperation({
    summary: 'List all tenants',
    description: 'Returns all registered car rental companies.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tenants retrived successfully.',
  })
  findAll() {
    return this.tenantsService.findAll();
  }

  @Post()
  @ApiResponse({
    status: 201,
    description: 'Tenant created successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid tenant data.',
  })
  @ApiResponse({
    status: 409,
    description: 'A tenant with this slug already exists.',
  })
  @ApiOperation({
    summary: 'Create a new tenant.',
    description: 'Registers a new car rental company with PENDING status.',
  })
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantsService.create(createTenantDto);
  }
}
