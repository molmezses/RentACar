import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';

import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { LoginResponseDto } from './dto/login-response.dto.js';
import { PlatformAdminResponseDto } from './dto/platform-admin-response.dto.js';

import { TenantAdminActivationService } from './tenant-admin-activation.service.js';
import { ActivateTenantAdminDto } from './dto/activate-tenant-admin.dto.js';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly activationService: TenantAdminActivationService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Platform yöneticisi girişi',
  })
  @ApiBody({
    type: LoginDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Giriş başarılı, JWT oluşturuldu.',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Gönderilen bilgiler geçersiz.',
  })
  @ApiResponse({
    status: 401,
    description: 'E-posta veya şifre hatalı.',
  })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('tenant/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Şirket yöneticisi hesabını etkinleştirir',
  })
  @ApiBody({
    type: ActivateTenantAdminDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Hesap başarıyla etkinleştirildi.',
  })
  @ApiResponse({
    status: 400,
    description: 'Aktivasyon bağlantısı geçersiz veya süresi dolmuş.',
  })
  async activateTenantAdmin(@Body() dto: ActivateTenantAdminDto) {
    return this.activationService.activate(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Giriş yapan platform yöneticisinin bilgileri',
  })
  @ApiResponse({
    status: 200,
    description: 'Yönetici bilgileri başarıyla getirildi.',
    type: PlatformAdminResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Geçersiz veya eksik erişim tokenı.',
  })
  getProfile(
    @Req()
    request: Request & {
      platformAdmin?: {
        id: string;
        email: string;
      };
    },
  ) {
    return request.platformAdmin;
  }
}
