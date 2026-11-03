import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { TenantsService } from './tenants.service.js';

@ApiTags('Tenants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tenants')
export class TenantsController {
  constructor(
    private readonly tenantsService: TenantsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List all tenants (Super Admin)',
    description:
      'Returns all registered companies. Requires platform admin authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tenants retrieved successfully.',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid platform admin token.',
  })
  findAll() {
    return this.tenantsService.findAll();
  }
}