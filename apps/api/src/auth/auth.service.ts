import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

import { PrismaService } from '../prisma/prisma.service.js';
import { LoginDto } from './dto/login.dto.js';

import { createHash, randomBytes } from 'node:crypto';

import { TenantRefreshDto } from './dto/tenant-refresh.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();

    const admin = await this.prisma.platformAdmin.findUnique({
      where: { email },
    });

    if (!admin) {
      throw new UnauthorizedException('E-posta veya şifre hatalı.');
    }

    const isPasswordValid = await argon2.verify(
      admin.passwordHash,
      dto.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('E-posta veya şifre hatalı.');
    }

    const payload = {
      sub: admin.id,
      type: 'platform_admin',
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: 900,
    };
  }

  async loginTenant(dto: LoginDto) {
  const email = dto.email.trim().toLowerCase();

  // 1. Find the tenant administrator.
  const admin = await this.prisma.tenantAdmin.findUnique({
    where: { email },
    include: {
      tenant: true,
    },
  });

  // 2. Check whether the account can sign in.
  if (
    !admin ||
    !admin.passwordHash ||
    !admin.activatedAt ||
    !admin.emailVerifiedAt ||
    admin.disabledAt ||
    admin.tenant.status !== 'APPROVED'
  ) {
    throw new UnauthorizedException(
      'E-mail or password is incorrect or the account is not active ',
    );
  }

  // 3. Verify the password.
  const isPasswordValid = await argon2.verify(
    admin.passwordHash,
    dto.password,
  );

  if (!isPasswordValid) {
    throw new UnauthorizedException(
      'E-mail or password is incorrect or the account is not active',
    );
  }

  // 4. Generate a random refresh token.
  const refreshToken = randomBytes(32).toString('base64url');

  // 5. Store only its SHA-256 hash.
  const refreshTokenHash = createHash('sha256')
    .update(refreshToken)
    .digest('hex');

  const expiresAt = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000,
  );

  const session = await this.prisma.tenantAdminSession.create({
    data: {
      tenantAdminId: admin.id,
      refreshTokenHash,
      expiresAt,
    },
  });

  // 6. Generate a short-lived access token.
  const accessToken = await this.jwtService.signAsync({
    sub: admin.id,
    type: 'tenant_admin',
    tenantId: admin.tenantId,
    sessionId: session.id,
  });

  return {
    accessToken,
    refreshToken,
    tokenType: 'Bearer',
    expiresIn: 900,
  };
}


async refreshTenant(dto: TenantRefreshDto) {
  const invalidTokenMessage =
    'Geçersiz veya süresi dolmuş oturum.';

  // 1. Gelen refresh token'ın SHA-256 özetini oluştur.
  const currentTokenHash = createHash('sha256')
    .update(dto.refreshToken)
    .digest('hex');

  // 2. Bu token'a ait oturumu ve yöneticiyi bul.
  const session = await this.prisma.tenantAdminSession.findUnique({
    where: {
      refreshTokenHash: currentTokenHash,
    },
    include: {
      tenantAdmin: {
        include: {
          tenant: true,
        },
      },
    },
  });

  const now = new Date();

  // 3. Oturum, yönetici ve şirket hâlâ geçerli mi?
  if (
    !session ||
    session.revokedAt ||
    session.expiresAt <= now ||
    !session.tenantAdmin.passwordHash ||
    !session.tenantAdmin.activatedAt ||
    !session.tenantAdmin.emailVerifiedAt ||
    session.tenantAdmin.disabledAt ||
    session.tenantAdmin.tenant.status !== 'APPROVED'
  ) {
    throw new UnauthorizedException(invalidTokenMessage);
  }

  // 4. Yeni, rastgele refresh token üret.
  const newRefreshToken = randomBytes(32).toString('base64url');

  const newRefreshTokenHash = createHash('sha256')
    .update(newRefreshToken)
    .digest('hex');

  // 5. Eski token hash'ini atomik olarak yenisiyle değiştir.
  const rotation = await this.prisma.tenantAdminSession.updateMany({
    where: {
      id: session.id,
      refreshTokenHash: currentTokenHash,
      revokedAt: null,
      expiresAt: { gt: now },
    },
    data: {
      refreshTokenHash: newRefreshTokenHash,
    },
  });

  // Başka bir istek token'ı bizden önce yenilemiş olabilir.
  if (rotation.count !== 1) {
    throw new UnauthorizedException(invalidTokenMessage);
  }

  // 6. Aynı oturum için yeni JWT oluştur.
  const accessToken = await this.jwtService.signAsync({
    sub: session.tenantAdmin.id,
    type: 'tenant_admin',
    tenantId: session.tenantAdmin.tenantId,
    sessionId: session.id,
  });

  return {
    accessToken,
    refreshToken: newRefreshToken,
    tokenType: 'Bearer',
    expiresIn: 900,
  };
}

async logoutTenant(tenantAdminId: string, sessionId: string) {
  const result = await this.prisma.tenantAdminSession.updateMany({
    where: {
      id: sessionId,
      tenantAdminId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });

  if (result.count !== 1) {
    throw new UnauthorizedException('Oturum geçersiz.');
  }
}

}