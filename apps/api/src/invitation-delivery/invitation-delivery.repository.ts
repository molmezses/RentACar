
import { randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';

import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

import { MAX_INVITATION_ATTEMPTS } from './invitation-retry.policy.js';

export interface ClaimedInvitation {
  id: string;
  claimId: string;
}

@Injectable()
export class InvitationDeliveryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async claimNext(
    now: Date,
    lockDurationMs: number,
    deliveryId?: string,
  ): Promise<ClaimedInvitation | null> {
    if (lockDurationMs <= 0) {
      throw new Error('lockDurationMs must be positive.');
    }

    const claimId = randomUUID();
    const lockedUntil = new Date(now.getTime() + lockDurationMs);

    const deliveryFilter = deliveryId
      ? Prisma.sql`AND id = ${deliveryId}`
      : Prisma.empty;

    const claimed = await this.prisma.$queryRaw<ClaimedInvitation[]>`
      WITH candidate AS (
        SELECT id
        FROM "InvitationDelivery"
        WHERE
          "attempts" < ${MAX_INVITATION_ATTEMPTS}
          AND (
            (
              "status" = 'PENDING'
              AND (
                "nextAttemptAt" IS NULL
                OR "nextAttemptAt" <= ${now}
              )
            )
            OR (
              "status" = 'FAILED'
              AND "nextAttemptAt" IS NOT NULL
              AND "nextAttemptAt" <= ${now}
            )
            OR (
              "status" = 'PROCESSING'
              AND "lockedUntil" IS NOT NULL
              AND "lockedUntil" <= ${now}
            )
          )
          ${deliveryFilter}
        ORDER BY "createdAt" ASC
        FOR UPDATE SKIP LOCKED
        LIMIT 1
      )
      UPDATE "InvitationDelivery"
      SET
        "status" = 'PROCESSING',
        "claimId" = ${claimId},
        "lockedUntil" = ${lockedUntil},
        "nextAttemptAt" = NULL,
        "attempts" = "attempts" + 1,
        "updatedAt" = ${now}
      WHERE id IN (SELECT id FROM candidate)
      RETURNING id, "claimId"
    `;

    return claimed[0] ?? null;
  }

  async markSent(
    id: string,
    claimId: string,
    now: Date,
  ): Promise<boolean> {
    const result = await this.prisma.invitationDelivery.updateMany({
      where: {
        id,
        claimId,
        status: 'PROCESSING',
        lockedUntil: { gt: now },
      },
      data: {
        status: 'SENT',
        sentAt: now,
        lockedUntil: null,
        nextAttemptAt: null,
        encryptedToken: null,
        claimId: null,
        lastErrorCode: null,
      },
    });

    return result.count === 1;
  }

  async markFailed(
    id: string,
    claimId: string,
    now: Date,
    nextAttemptAt: Date | null,
    errorCode: string,
  ): Promise<boolean> {
    const result = await this.prisma.invitationDelivery.updateMany({
      where: {
        id,
        claimId,
        status: 'PROCESSING',
        lockedUntil: { gt: now },
      },
      data: {
        status: 'FAILED',
        lockedUntil: null,
        claimId: null,
        nextAttemptAt,
        lastErrorCode: errorCode,
      },
    });

    return result.count === 1;
  }

  async recoverExhausted(now: Date): Promise<number> {
    const result = await this.prisma.invitationDelivery.updateMany({
      where: {
        status: 'PROCESSING',
        attempts: {
          gte: MAX_INVITATION_ATTEMPTS,
        },
        lockedUntil: {
          lte: now,
        },
      },
      data: {
        status: 'FAILED',
        claimId: null,
        lockedUntil: null,
        nextAttemptAt: null,
        encryptedToken: null,
        lastErrorCode: 'MAX_ATTEMPTS_EXCEEDED',
      },
    });

    return result.count;
  }
}
