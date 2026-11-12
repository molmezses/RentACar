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

import { TenantLoginResponseDto } from './dto/tenant-login-response.dto.js';
import { TenantRefreshDto } from './dto/tenant-refresh.dto.js';

import {
  TenantJwtAuthGuard,
  type TenantAuthenticatedRequest,
} from './guards/tenant-jwt-auth.guard.js';

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

  @Post('tenant/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Tenant admin login',
  })
  @ApiBody({
    type: LoginDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Login successfull. Sessions and tokens created',
    type: TenantLoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Email , Password or account status is invalid.',
  })
  async loginTenant(@Body() dto: LoginDto) {
    return this.authService.loginTenant(dto);
  }


@Get('tenant/me')
@UseGuards(TenantJwtAuthGuard)
@ApiBearerAuth()
@ApiOperation({
  summary: 'Giriş yapan şirket yöneticisinin bilgileri',
})
@ApiResponse({
  status: 200,
  description: 'Şirket yöneticisi bilgileri getirildi.',
})
@ApiResponse({
  status: 401,
  description: 'Geçersiz veya iptal edilmiş oturum.',
})
getTenantProfile(@Req() request: TenantAuthenticatedRequest) {
  const admin = request.tenantAdmin!;

  return {
    id: admin.id,
    email: admin.email,
    tenantId: admin.tenantId,
  };
}

@Post('tenant/logout')
@UseGuards(TenantJwtAuthGuard)
@HttpCode(HttpStatus.NO_CONTENT)
@ApiBearerAuth()
@ApiOperation({
  summary: 'Şirket yöneticisinin mevcut oturumunu kapatır',
})
@ApiResponse({
  status: 204,
  description: 'Oturum kapatıldı.',
})
@ApiResponse({
  status: 401,
  description: 'Geçersiz veya iptal edilmiş oturum.',
})
async logoutTenant(@Req() request: TenantAuthenticatedRequest) {
  const admin = request.tenantAdmin!;

  await this.authService.logoutTenant(
    admin.id,
    admin.sessionId,
  );
}


  @Post('tenant/refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Şirket yöneticisinin oturumunu yeniler',
  })
  @ApiBody({
    type: TenantRefreshDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Yeni access ve refresh token oluşturuldu.',
    type: TenantLoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token geçersiz veya oturum sona ermiş.',
  })
  async refreshTenant(@Body() dto: TenantRefreshDto) {
    return this.authService.refreshTenant(dto);
  }

  @Post('tenant/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Activates tenant admin account',
  })
  @ApiBody({
    type: ActivateTenantAdminDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Account successfully activated',
  })
  @ApiResponse({
    status: 400,
    description: 'The activation link is invalid or expired ',
  })
  async activateTenantAdmin(@Body() dto: ActivateTenantAdminDto) {
    return this.activationService.activate(dto);
  }

  
}
