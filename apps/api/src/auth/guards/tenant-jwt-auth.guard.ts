
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

import { PrismaService } from '../../prisma/prisma.service.js';

export type TenantAuthenticatedRequest = Request & {
  tenantAdmin?: {
    id: string;
    email: string;
    tenantId: string;
    sessionId: string;
  };
};

@Injectable()
export class TenantJwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<TenantAuthenticatedRequest>();

    const authorization = request.headers.authorization;
    const [scheme, token, extra] = authorization?.split(' ') ?? [];

    if (scheme !== 'Bearer' || !token || extra !== undefined) {
      throw new UnauthorizedException(
        'Geçerli bir Bearer token gereklidir.',
      );
    }

    let payload: unknown;

    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException(
        'Geçersiz veya süresi dolmuş token.',
      );
    }

    if (
      typeof payload !== 'object' ||
      payload === null ||
      !('sub' in payload) ||
      typeof payload.sub !== 'string' ||
      !('type' in payload) ||
      payload.type !== 'tenant_admin' ||
      !('tenantId' in payload) ||
      typeof payload.tenantId !== 'string' ||
      !('sessionId' in payload) ||
      typeof payload.sessionId !== 'string'
    ) {
      throw new UnauthorizedException('Geçersiz token içeriği.');
    }

    const session = await this.prisma.tenantAdminSession.findUnique({
      where: { id: payload.sessionId },
      include: {
        tenantAdmin: {
          include: {
            tenant: true,
          },
        },
      },
    });

    const now = new Date();

    if (
      !session ||
      session.revokedAt !== null ||
      session.expiresAt <= now ||
      session.tenantAdminId !== payload.sub ||
      session.tenantAdmin.tenantId !== payload.tenantId
    ) {
      throw new UnauthorizedException('Oturum geçersiz.');
    }

    const admin = session.tenantAdmin;

    if (
      !admin.passwordHash ||
      !admin.activatedAt ||
      !admin.emailVerifiedAt ||
      admin.disabledAt ||
      admin.tenant.status !== 'APPROVED'
    ) {
      throw new UnauthorizedException('Hesap aktif değil.');
    }

    request.tenantAdmin = {
      id: admin.id,
      email: admin.email,
      tenantId: admin.tenantId,
      sessionId: session.id,
    };

    return true;
  }
}
