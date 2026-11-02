import {
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PrismaService } from '../../prisma/prisma.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  let verifyAsync: ReturnType<typeof vi.fn>;
  let findUnique: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    verifyAsync = vi.fn();
    findUnique = vi.fn();

    const jwtService = {
      verifyAsync,
    } as unknown as JwtService;

    const prismaService = {
      platformAdmin: {
        findUnique,
      },
    } as unknown as PrismaService;

    guard = new JwtAuthGuard(jwtService, prismaService);
  });

  function createContext(authorization?: string) {
    const request: {
      headers: { authorization?: string };
      platformAdmin?: {
        id: string;
        email: string;
      };
    } = {
      headers: {},
    };

    if (authorization) {
      request.headers.authorization = authorization;
    }

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;

    return { context, request };
  }

  it('token yoksa erişimi reddeder', async () => {
    const { context } = createContext();

    await expect(
      guard.canActivate(context),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(verifyAsync).not.toHaveBeenCalled();
  });

  it('Bearer formatı yanlışsa erişimi reddeder', async () => {
    const { context } = createContext('Basic abc123');

    await expect(
      guard.canActivate(context),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(verifyAsync).not.toHaveBeenCalled();
  });

  it('JWT doğrulaması başarısızsa erişimi reddeder', async () => {
    verifyAsync.mockRejectedValue(new Error('Invalid signature'));

    const { context } = createContext('Bearer invalid-token');

    await expect(
      guard.canActivate(context),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(findUnique).not.toHaveBeenCalled();
  });

  it('kullanıcı türü platform_admin değilse reddeder', async () => {
    verifyAsync.mockResolvedValue({
      sub: 'admin-123',
      type: 'tenant_admin',
    });

    const { context } = createContext('Bearer valid-token');

    await expect(
      guard.canActivate(context),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(findUnique).not.toHaveBeenCalled();
  });

  it('yönetici veritabanında yoksa erişimi reddeder', async () => {
    verifyAsync.mockResolvedValue({
      sub: 'admin-123',
      type: 'platform_admin',
    });

    findUnique.mockResolvedValue(null);

    const { context } = createContext('Bearer valid-token');

    await expect(
      guard.canActivate(context),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('geçerli token ile erişime izin verir', async () => {
    const admin = {
      id: 'admin-123',
      email: 'admin@example.com',
    };

    verifyAsync.mockResolvedValue({
      sub: admin.id,
      type: 'platform_admin',
    });

    findUnique.mockResolvedValue(admin);

    const { context, request } = createContext(
      'Bearer valid-token',
    );

    const result = await guard.canActivate(context);

    expect(result).toBe(true);

    expect(request.platformAdmin).toEqual(admin);

    expect(findUnique).toHaveBeenCalledWith({
      where: { id: admin.id },
      select: {
        id: true,
        email: true,
      },
    });
  });
});