import { randomUUID, createHash } from 'node:crypto';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';
import { describe, expect, it } from 'vitest';

import { PrismaService } from '../../src/prisma/prisma.service.js';
import { InvitationDeliveryRepository } from '../../src/invitation-delivery/invitation-delivery.repository.js';

// 1. Explicitly require the test database.
const databaseUrl = process.env['TEST_DATABASE_URL'];

if (!databaseUrl) {
  throw new Error('TEST_DATABASE_URL is required.');
}

const url = new URL(databaseUrl);

if (
  !['postgres:', 'postgresql:'].includes(url.protocol) ||
  !['localhost', '127.0.0.1'].includes(url.hostname) ||
  url.pathname !== '/rentacar_test'
) {
  throw new Error('Only the local rentacar_test database is allowed.');
}

// 2. Establish a real PostgreSQL connection.
const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: databaseUrl,
  }),
});

const repository = new InvitationDeliveryRepository(
  prisma as unknown as PrismaService,
);

describe('InvitationDeliveryRepository - PostgreSQL', () => {
  it('allows only one concurrent worker to claim a pending invitation', async () => {
    const suffix = randomUUID();

    const tenantId = randomUUID();
    const tenantAdminId = randomUUID();

    const slug = `c4-claim-${suffix}`;
    const email = `c4-claim-${suffix}@example.test`;

    let activationTokenId: string | undefined;
    let deliveryId: string | undefined;

    await prisma.$connect();

    try {
      // 3. Verify the actual database before creating test data.
      const databases = await prisma.$queryRaw<
        Array<{ name: string }>
      >`SELECT current_database() AS name`;

      expect(databases[0]?.name).toBe('rentacar_test');

      // 4. Create the test tenant.
      await prisma.tenant.create({
        data: {
          id: tenantId,
          name: 'C4 Claim Test Company',
          slug,
          status: 'APPROVED',
        },
      });

      // 5. Create its administrator.
      await prisma.tenantAdmin.create({
        data: {
          id: tenantAdminId,
          tenantId,
          email,
        },
      });

      // 6. Create an activation token record.
      const tokenHash = createHash('sha256').update(randomUUID()).digest('hex');

      const token = await prisma.tenantActivationToken.create({
        data: {
          tenantAdminId,
          tokenHash,
          expiresAt: new Date(Date.now() + 86_400_000),
        },
      });

      activationTokenId = token.id;

      // 7. Create one pending delivery.
      const delivery = await prisma.invitationDelivery.create({
        data: {
          tenantAdminId,
          activationTokenId: token.id,
          recipientEmail: email,
          encryptedToken: 'test-only-placeholder',
          status: 'PENDING',
        },
      });

      deliveryId = delivery.id;

      // 8. Simulate two workers requesting work concurrently.
      const now = new Date();
      const lockDurationMs = 60_000;

      const results = await Promise.all([
        repository.claimNext(now, lockDurationMs, delivery.id),
        repository.claimNext(now, lockDurationMs, delivery.id),
      ]);

      console.log('Claim results:', results);
      console.log('Expected delivery ID:', delivery.id);

      expect(
        results.filter((result) => result?.id === delivery.id),
      ).toHaveLength(1);

      expect(results.filter((result) => result === null)).toHaveLength(1);

      // 9. Read the actual PostgreSQL record.
      const saved = await prisma.invitationDelivery.findUniqueOrThrow({
        where: { id: delivery.id },
      });

      expect(saved.status).toBe('PROCESSING');
      expect(saved.attempts).toBe(1);
      expect(saved.lockedUntil?.getTime()).toBe(now.getTime() + lockDurationMs);
      expect(saved.claimId).toBeTruthy();

      // A delivery that reached the maximum number of attempts
      // must never be claimed again.
      await prisma.invitationDelivery.update({
        where: { id: delivery.id },
        data: {
          status: 'PROCESSING',
          attempts: 5,
          lockedUntil: new Date(now.getTime() - 60_000),
          claimId: null,
        },
      });

      const exhaustedClaim = await repository.claimNext(
        now,
        lockDurationMs,
        delivery.id,
      );

      expect(exhaustedClaim).toBeNull();
    } finally {
      // 10. Clean up only this test's records.
      if (deliveryId) {
        await prisma.invitationDelivery.deleteMany({
          where: { id: deliveryId },
        });
      }

      if (activationTokenId) {
        await prisma.tenantActivationToken.deleteMany({
          where: { id: activationTokenId },
        });
      }

      await prisma.tenantAdmin.deleteMany({
        where: { id: tenantAdminId },
      });

      await prisma.tenant.deleteMany({
        where: { id: tenantId },
      });

      await prisma.$disconnect();
    }
  });

  it('rejects stale worker updates after a new worker takes ownership', async () => {
    const suffix = randomUUID();

    const tenantId = randomUUID();
    const tenantAdminId = randomUUID();

    const email = `c4-fencing-${suffix}@example.test`;

    let activationTokenId: string | undefined;
    let deliveryId: string | undefined;

    await prisma.$connect();

    try {
      const databases = await prisma.$queryRaw<
        Array<{ name: string }>
      >`SELECT current_database() AS name`;

      expect(databases[0]?.name).toBe('rentacar_test');

      await prisma.tenant.create({
        data: {
          id: tenantId,
          name: 'C4 Fencing Test Company',
          slug: `c4-fencing-${suffix}`,
          status: 'APPROVED',
        },
      });

      await prisma.tenantAdmin.create({
        data: {
          id: tenantAdminId,
          tenantId,
          email,
        },
      });

      const token = await prisma.tenantActivationToken.create({
        data: {
          tenantAdminId,
          tokenHash: createHash('sha256').update(randomUUID()).digest('hex'),
          expiresAt: new Date(Date.now() + 86_400_000),
        },
      });

      activationTokenId = token.id;

      const delivery = await prisma.invitationDelivery.create({
        data: {
          tenantAdminId,
          activationTokenId: token.id,
          recipientEmail: email,
          encryptedToken: 'test-only-placeholder',
          status: 'PENDING',
        },
      });

      deliveryId = delivery.id;

      // Worker A owns the invitation at 12:00.
      const start = new Date('2026-11-10T12:00:00.000Z');

      const firstClaim = await repository.claimNext(start, 60_000, delivery.id);

      expect(firstClaim).not.toBeNull();

      if (!firstClaim) {
        throw new Error('Worker A could not claim invitation.');
      }

      // The first lease has expired by 12:02.
      // Worker B takes ownership.
      const secondClaim = await repository.claimNext(
        new Date('2026-11-10T12:02:00.000Z'),
        60_000,
        delivery.id,
      );

      expect(secondClaim).not.toBeNull();

      if (!secondClaim) {
        throw new Error('Worker B could not reclaim invitation.');
      }

      expect(firstClaim.claimId).not.toBe(secondClaim.claimId);

      // Worker A is no longer the owner.
      const staleSent = await repository.markSent(
        delivery.id,
        firstClaim.claimId,
        new Date('2026-11-10T12:02:10.000Z'),
      );

      expect(staleSent).toBe(false);

      const staleFailed = await repository.markFailed(
        delivery.id,
        firstClaim.claimId,
        new Date('2026-11-10T12:02:10.000Z'),
        null,
        'STALE_WORKER',
      );

      expect(staleFailed).toBe(false);

      // Worker B has the current ownership token.
      const currentSent = await repository.markSent(
        delivery.id,
        secondClaim.claimId,
        new Date('2026-11-10T12:02:20.000Z'),
      );

      expect(currentSent).toBe(true);

      const saved = await prisma.invitationDelivery.findUniqueOrThrow({
        where: { id: delivery.id },
      });

      expect(saved.status).toBe('SENT');
      expect(saved.attempts).toBe(2);
      expect(saved.claimId).toBeNull();
      expect(saved.lockedUntil).toBeNull();
      expect(saved.encryptedToken).toBeNull();
      expect(saved.sentAt).not.toBeNull();
    } finally {
      if (deliveryId) {
        await prisma.invitationDelivery.deleteMany({
          where: { id: deliveryId },
        });
      }

      if (activationTokenId) {
        await prisma.tenantActivationToken.deleteMany({
          where: { id: activationTokenId },
        });
      }

      await prisma.tenantAdmin.deleteMany({
        where: { id: tenantAdminId },
      });

      await prisma.tenant.deleteMany({
        where: { id: tenantId },
      });

      await prisma.$disconnect();
    }
  });
});
