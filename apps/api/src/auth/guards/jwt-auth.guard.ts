import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

import { PrismaService } from '../../prisma/prisma.service.js';

type AuthenticatedRequest = Request & {
  platformAdmin?: {
    id: string;
    email: string;
  };
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();

    const authorization = request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException('Token bulunamadı.');
    }

    const [type, token, extra] = authorization.split(' ');

    if (type !== 'Bearer' || !token || extra !== undefined) {
      throw new UnauthorizedException('Geçersiz token formatı.');
    }

    try {
      const payload: unknown = await this.jwtService.verifyAsync(token);

      if (
        typeof payload !== 'object' ||
        payload === null ||
        !('sub' in payload) ||
        typeof payload.sub !== 'string' ||
        !('type' in payload) ||
        payload.type !== 'platform_admin'
      ) {
        throw new UnauthorizedException('Geçersiz token içeriği.');
      }

      const admin = await this.prisma.platformAdmin.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
        },
      });

      if (!admin) {
        throw new UnauthorizedException('Yönetici bulunamadı.');
      }

      request.platformAdmin = admin;

      return true;
    } catch {
      throw new UnauthorizedException('Geçersiz veya süresi dolmuş token.');
    }
  }
}