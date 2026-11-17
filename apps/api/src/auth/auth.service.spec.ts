import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { createHash } from 'node:crypto';

import { AuthService } from './auth.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { JwtService } from '@nestjs/jwt';

import * as argon2 from 'argon2';

describe('Tenant authentication security', () => {
  const prisma = {
    tenantAdmin: {
      findUnique: vi.fn(),
    },
    tenantAdminSession: {
      findUnique: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn(),
    },
  };

  const jwtService = {
    signAsync: vi.fn(),
  };

  const authService = new AuthService(
    prisma as unknown as PrismaService,
    jwtService as unknown as JwtService,
  );

  const refreshToken = 'test-refresh-token';

  const refreshTokenHash = createHash('sha256')
    .update(refreshToken)
    .digest('hex');

  function validSession() {
    return {
      id: 'session-1',
      tenantAdminId: 'admin-1',
      refreshTokenHash,
      revokedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      tenantAdmin: {
        id: 'admin-1',
        tenantId: 'tenant-1',
        passwordHash: 'hashed-password',
        activatedAt: new Date(),
        emailVerifiedAt: new Date(),
        disabledAt: null as Date | null,
        tenant: {
          id: 'tenant-1',
          status: 'APPROVED',
        },
      },
    };
  }

  beforeEach(() => {
    vi.resetAllMocks();
    jwtService.signAsync.mockResolvedValue('new-access-token');
  });

  describe('Refresh token', () => {
    it('geçerli token ile yeni token üretmeli', async () => {
      const session = validSession();

      prisma.tenantAdminSession.findUnique.mockResolvedValue(session);

      prisma.tenantAdminSession.updateMany.mockResolvedValue({
        count: 1,
      });

      const result = await authService.refreshTenant({
        refreshToken,
      });

      expect(result.accessToken).toBe('new-access-token');
      expect(result.refreshToken).not.toBe(refreshToken);

      expect(prisma.tenantAdminSession.updateMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          id: session.id,
          refreshTokenHash,
          revokedAt: null,
        }),
        data: {
          refreshTokenHash: expect.any(String),
        },
      });

      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: 'admin-1',
        type: 'tenant_admin',
        tenantId: 'tenant-1',
        sessionId: 'session-1',
      });
    });

    it('eski refresh token tekrar kullanılamamalı', async () => {
      prisma.tenantAdminSession.findUnique
        .mockResolvedValueOnce(validSession())
        .mockResolvedValueOnce(null);

      prisma.tenantAdminSession.updateMany.mockResolvedValue({
        count: 1,
      });

      await authService.refreshTenant({ refreshToken });

      await expect(
        authService.refreshTenant({ refreshToken }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('eşzamanlı token rotasyonu çakışmasını reddetmeli', async () => {
      prisma.tenantAdminSession.findUnique.mockResolvedValue(validSession());

      prisma.tenantAdminSession.updateMany.mockResolvedValue({
        count: 0,
      });

      await expect(
        authService.refreshTenant({ refreshToken }),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('süresi dolmuş oturumu reddetmeli', async () => {
      prisma.tenantAdminSession.findUnique.mockResolvedValue({
        ...validSession(),
        expiresAt: new Date(Date.now() - 60_000),
      });

      await expect(
        authService.refreshTenant({ refreshToken }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('devre dışı bırakılmış hesabı reddetmeli', async () => {
      const session = validSession();

      session.tenantAdmin.disabledAt = new Date();

      prisma.tenantAdminSession.findUnique.mockResolvedValue(session);

      await expect(
        authService.refreshTenant({ refreshToken }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('onaylanmamış Tenant için refresh yapmamalı', async () => {
      const session = validSession();

      session.tenantAdmin.tenant.status = 'SUSPENDED';

      prisma.tenantAdminSession.findUnique.mockResolvedValue(session);

      await expect(
        authService.refreshTenant({ refreshToken }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('Logout', () => {
    it('yalnızca ilgili yöneticinin oturumunu iptal etmeli', async () => {
      prisma.tenantAdminSession.updateMany.mockResolvedValue({
        count: 1,
      });

      await authService.logoutTenant('admin-1', 'session-1');

      expect(prisma.tenantAdminSession.updateMany).toHaveBeenCalledWith({
        where: {
          id: 'session-1',
          tenantAdminId: 'admin-1',
          revokedAt: null,
        },
        data: {
          revokedAt: expect.any(Date),
        },
      });
    });

    it('zaten iptal edilmiş oturumun logout isteğini reddetmeli', async () => {
      prisma.tenantAdminSession.updateMany.mockResolvedValue({
        count: 0,
      });

      await expect(
        authService.logoutTenant('admin-1', 'session-1'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('Tenant Login', () => {
    const loginDto = {
      email: ' ADMIN@EXAMPLE.COM ',
      password: 'SecurePassword123!',
    };

    async function validAdmin() {
      return {
        id: 'admin-1',
        email: 'admin@example.com',
        tenantId: 'tenant-1',
        passwordHash: await argon2.hash(loginDto.password),
        activatedAt: new Date(),
        emailVerifiedAt: new Date(),
        disabledAt: null as Date | null,
        tenant: {
          id: 'tenant-1',
          status: 'APPROVED',
        },
      };
    }

    it('doğru e-posta ve şifreyle giriş yapmalı', async () => {
      prisma.tenantAdmin.findUnique.mockResolvedValue(await validAdmin());

      prisma.tenantAdminSession.create.mockResolvedValue({
        id: 'new-session-1',
      });

      const result = await authService.loginTenant(loginDto);

      expect(result.accessToken).toBe('new-access-token');
      expect(result.refreshToken).toEqual(expect.any(String));

      expect(result.refreshToken).not.toBe('');

      expect(prisma.tenantAdmin.findUnique).toHaveBeenCalledWith({
        where: {
          email: 'admin@example.com',
        },
        include: {
          tenant: true,
        },
      });

      expect(prisma.tenantAdminSession.create).toHaveBeenCalledWith({
        data: {
          tenantAdminId: 'admin-1',
          refreshTokenHash: expect.any(String),
          expiresAt: expect.any(Date),
        },
      });

      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: 'admin-1',
        type: 'tenant_admin',
        tenantId: 'tenant-1',
        sessionId: 'new-session-1',
      });
    });

    it('yanlış şifreyle giriş yapamamalı', async () => {
      prisma.tenantAdmin.findUnique.mockResolvedValue(await validAdmin());

      await expect(
        authService.loginTenant({
          email: loginDto.email,
          password: 'WrongPassword123!',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      expect(prisma.tenantAdminSession.create).not.toHaveBeenCalled();
    });

    it('kayıtlı olmayan e-postayı reddetmeli', async () => {
      prisma.tenantAdmin.findUnique.mockResolvedValue(null);

      await expect(authService.loginTenant(loginDto)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('aktive edilmemiş hesabı reddetmeli', async () => {
      const admin = await validAdmin();

      prisma.tenantAdmin.findUnique.mockResolvedValue({
        ...admin,
        activatedAt: null,
        passwordHash: null,
      });

      await expect(authService.loginTenant(loginDto)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('devre dışı bırakılmış hesabı reddetmeli', async () => {
      const admin = await validAdmin();

      prisma.tenantAdmin.findUnique.mockResolvedValue({
        ...admin,
        disabledAt: new Date(),
      });

      await expect(authService.loginTenant(loginDto)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('askıya alınmış Tenant hesabını reddetmeli', async () => {
      const admin = await validAdmin();

      prisma.tenantAdmin.findUnique.mockResolvedValue({
        ...admin,
        tenant: {
          id: 'tenant-1',
          status: 'SUSPENDED',
        },
      });

      await expect(authService.loginTenant(loginDto)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });

  


});
