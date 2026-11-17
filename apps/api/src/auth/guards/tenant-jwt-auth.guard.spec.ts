
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  UnauthorizedException,
  type ExecutionContext,
} from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';

import { TenantJwtAuthGuard } from './tenant-jwt-auth.guard.js';
import type { PrismaService } from '../../prisma/prisma.service.js';

describe('TenantJwtAuthGuard', () => {
  const request = {
    headers: {
      authorization: 'Bearer valid-tenant-token',
    },
    tenantAdmin: undefined as
      | {
          id: string;
          email: string;
          tenantId: string;
          sessionId: string;
        }
      | undefined,
  };

  const jwtService = {
    verifyAsync: vi.fn(),
  };

  const prisma = {
    tenantAdminSession: {
      findUnique: vi.fn(),
    },
  };

  const guard = new TenantJwtAuthGuard(
    jwtService as unknown as JwtService,
    prisma as unknown as PrismaService,
  );

  const context = {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;

  function validSession() {
    return {
      id: 'session-a',
      tenantAdminId: 'admin-a',
      revokedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      tenantAdmin: {
        id: 'admin-a',
        email: 'admin-a@example.com',
        tenantId: 'tenant-a',
        passwordHash: 'hashed-password',
        activatedAt: new Date(),
        emailVerifiedAt: new Date(),
        disabledAt: null,
        tenant: {
          status: 'APPROVED',
        },
      },
    };
  }

  const validPayload = {
    sub: 'admin-a',
    type: 'tenant_admin',
    tenantId: 'tenant-a',
    sessionId: 'session-a',
  };

  beforeEach(() => {
    vi.resetAllMocks();

    request.headers.authorization =
      'Bearer valid-tenant-token';
    request.tenantAdmin = undefined;

    jwtService.verifyAsync.mockResolvedValue(
      validPayload,
    );

    prisma.tenantAdminSession.findUnique.mockResolvedValue(
      validSession(),
    );
  });

  it('geçerli Tenant oturumunu kabul etmeli', async () => {
    await expect(
      guard.canActivate(context),
    ).resolves.toBe(true);

    expect(request.tenantAdmin).toEqual({
      id: 'admin-a',
      email: 'admin-a@example.com',
      tenantId: 'tenant-a',
      sessionId: 'session-a',
    });
  });

  it('Platform Admin JWT tokenını reddetmeli', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: 'platform-admin',
      type: 'platform_admin',
    });

    await expect(
      guard.canActivate(context),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(
      prisma.tenantAdminSession.findUnique,
    ).not.toHaveBeenCalled();
  });

  it('süresi dolmuş veya geçersiz JWT tokenını reddetmeli', async () => {
    jwtService.verifyAsync.mockRejectedValue(
      new Error('jwt expired'),
    );

    await expect(
      guard.canActivate(context),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('JWT içindeki tenantId değiştirilmişse reddetmeli', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      ...validPayload,
      tenantId: 'tenant-b',
    });

    await expect(
      guard.canActivate(context),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(request.tenantAdmin).toBeUndefined();
  });

  it('JWT başka yöneticinin oturumunu gösteriyorsa reddetmeli', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      ...validPayload,
      sub: 'admin-b',
    });

    await expect(
      guard.canActivate(context),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('iptal edilmiş oturumu reddetmeli', async () => {
    prisma.tenantAdminSession.findUnique.mockResolvedValue({
      ...validSession(),
      revokedAt: new Date(),
    });

    await expect(
      guard.canActivate(context),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('süresi dolmuş oturumu reddetmeli', async () => {
    prisma.tenantAdminSession.findUnique.mockResolvedValue({
      ...validSession(),
      expiresAt: new Date(Date.now() - 60_000),
    });

    await expect(
      guard.canActivate(context),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('devre dışı bırakılmış yöneticiyi reddetmeli', async () => {
    const session = validSession();

    prisma.tenantAdminSession.findUnique.mockResolvedValue({
      ...session,
      tenantAdmin: {
        ...session.tenantAdmin,
        disabledAt: new Date(),
      },
    });

    await expect(
      guard.canActivate(context),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('askıya alınmış şirketin oturumunu reddetmeli', async () => {
    const session = validSession();

    prisma.tenantAdminSession.findUnique.mockResolvedValue({
      ...session,
      tenantAdmin: {
        ...session.tenantAdmin,
        tenant: {
          status: 'SUSPENDED',
        },
      },
    });

    await expect(
      guard.canActivate(context),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
