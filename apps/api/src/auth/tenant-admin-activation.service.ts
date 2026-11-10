
import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import * as argon2 from 'argon2';

import { PrismaService } from '../prisma/prisma.service.js';
import { InvitationSecurityService } from '../invitation-security/invitation-security.service.js';

import { ActivateTenantAdminDto } from './dto/activate-tenant-admin.dto.js';

@Injectable()
export class TenantAdminActivationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly invitationSecurity: InvitationSecurityService,
  ) {}

  async activate(dto: ActivateTenantAdminDto) {
    // 1. Convert the raw token into its SHA-256 hash.
    const tokenHash = this.invitationSecurity.hashToken(
      dto.token,
    );

    // 2. Hash the new password with Argon2.
    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
    });

    const now = new Date();

    // 3. Consume token and activate admin atomically.
    await this.prisma.$transaction(async (tx) => {
      const activation =
        await tx.tenantActivationToken.findUnique({
          where: { tokenHash },
          select: {
            id: true,
            tenantAdminId: true,
          },
        });

      if (!activation) {
        throw new BadRequestException(
          'Aktivasyon bağlantısı geçersiz veya süresi dolmuş.',
        );
      }

      // Claim the token only if it is still valid and unused.
      const consumed =
        await tx.tenantActivationToken.updateMany({
          where: {
            id: activation.id,
            consumedAt: null,
            expiresAt: { gt: now },
          },
          data: {
            consumedAt: now,
          },
        });

      if (consumed.count !== 1) {
        throw new BadRequestException(
          'Aktivasyon bağlantısı geçersiz veya süresi dolmuş.',
        );
      }

      // Activate only an account that is not already active
      // and has not been disabled.
      const updatedAdmin = await tx.tenantAdmin.updateMany({
        where: {
          id: activation.tenantAdminId,
          activatedAt: null,
          disabledAt: null,
          passwordHash: null,
        },
        data: {
          passwordHash,
          activatedAt: now,
          emailVerifiedAt: now,
        },
      });

      if (updatedAdmin.count !== 1) {
        throw new BadRequestException(
          'Aktivasyon işlemi gerçekleştirilemedi.',
        );
      }
    });

    return {
      message: 'Hesabınız başarıyla etkinleştirildi.',
    };
  }
}
