import { Body, Controller, Get, Post } from '@nestjs/common';
import { TenantsService } from './tenants.service.js';
import { CreateTenantDto } from "./dto/create-tenant.dto.js";

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  findAll() {
    return this.tenantsService.findAll();
  }

  @Post()
  create(@Body() createTenantDto : CreateTenantDto){
    return this.tenantsService.create(createTenantDto);
  }


}