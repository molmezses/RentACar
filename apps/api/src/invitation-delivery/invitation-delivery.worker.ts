import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../prisma/prisma.service.js';
import { InvitationSecurityService } from '../invitation-security/invitation-security.service.js';

import { InvitationDeliveryRepository } from './invitation-delivery.repository.js';
import { InvitationDeliveryService } from './invitation-delivery.service.js';
import { calculateNextAttemptAt } from './invitation-retry.policy.js';

@Injectable()
export class InvitationDeliveryWorker {
  constructor(
    private readonly repository: InvitationDeliveryRepository,
    private readonly prisma: PrismaService,
    private readonly security: InvitationSecurityService,
    private readonly deliveryService: InvitationDeliveryService,
    private readonly config: ConfigService,
  ) {}

  async processOne(): Promise<boolean> {
    const claimed = await this.repository.claimNext(new Date(), 120_000);

    if (!claimed) {
      return false;
    }

    const { id, claimId } = claimed;

    const delivery = await this.prisma.invitationDelivery.findUniqueOrThrow({
      where: { id },
      include: {
        activationToken: true,
      },
    });

    const token = delivery.activationToken;
    const now = new Date();

    // Do not send expired or already consumed tokens.
    if (token.expiresAt <= now || token.consumedAt !== null) {
      await this.repository.markFailed(
        id,
        claimId,
        now,
        null,
        'ACTIVATION_TOKEN_INVALID',
      );

      return true;
    }

    if (!delivery.encryptedToken) {
      await this.repository.markFailed(
        id,
        claimId,
        now,
        null,
        'ENCRYPTED_TOKEN_MISSING',
      );

      return true;
    }

    let rawToken: string;

    try {
      rawToken = this.security.decryptToken(delivery.encryptedToken);
    } catch {
      await this.repository.markFailed(
        id,
        claimId,
        new Date(),
        null,
        'TOKEN_DECRYPTION_FAILED',
      );

      return true;
    }

    const baseUrl = this.config.getOrThrow<string>(
      'TENANT_ACTIVATION_BASE_URL',
    );

    const activationUrl = new URL('/activate', baseUrl);
    activationUrl.searchParams.set('token', rawToken);

    // Step 1: Send the invitation email.
    try {
      await this.deliveryService.sendInvitation({
        recipientEmail: delivery.recipientEmail,
        activationUrl: activationUrl.toString(),
        expiresAt: token.expiresAt,
      });
    } catch {
      // Only email delivery failures enter this block.
      const failedAt = new Date();

      const nextAttemptAt = calculateNextAttemptAt(delivery.attempts, failedAt);

      await this.repository.markFailed(
        id,
        claimId,
        failedAt,
        nextAttemptAt,
        'EMAIL_SEND_FAILED',
      );

      return true;
    }

    // Step 2: Persist the successful sending result.
    // A database error must not be classified as an email error.
    const markedSent = await this.repository.markSent(id, claimId, new Date());

    if (!markedSent) {
      // The claim may have expired or another worker may
      // have taken ownership. Do not overwrite its state.
      return true;
    }

    return true;
  }
}
