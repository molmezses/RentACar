
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { InvitationDeliveryWorker } from './invitation-delivery.worker.js';
import { InvitationDeliveryRepository } from './invitation-delivery.repository.js';
import { InvitationDeliveryService } from './invitation-delivery.service.js';

import { PrismaService } from '../prisma/prisma.service.js';
import { InvitationSecurityService } from '../invitation-security/invitation-security.service.js';
import { ConfigService } from '@nestjs/config';

describe('InvitationDeliveryWorker', () => {
  const claim = {
    id: 'delivery-123',
    claimId: 'claim-abc',
  };

  const validToken = {
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    consumedAt: null,
  };

  const delivery = {
    id: claim.id,
    claimId: claim.claimId,
    recipientEmail: 'owner@example.test',
    encryptedToken: 'encrypted-placeholder',
    attempts: 1,
    activationToken: validToken,
  };

  const repository = {
    claimNext: vi.fn(),
    markSent: vi.fn(),
    markFailed: vi.fn(),
  };

  const prisma = {
    invitationDelivery: {
      findUniqueOrThrow: vi.fn(),
    },
  };

  const security = {
    decryptToken: vi.fn(),
  };

  const deliveryService = {
    sendInvitation: vi.fn(),
  };

  const config = {
    getOrThrow: vi.fn(),
  };

  let worker: InvitationDeliveryWorker;

  beforeEach(() => {
    vi.resetAllMocks();

    repository.claimNext.mockResolvedValue(claim);
    repository.markSent.mockResolvedValue(true);
    repository.markFailed.mockResolvedValue(true);

    prisma.invitationDelivery.findUniqueOrThrow.mockResolvedValue(delivery);
    security.decryptToken.mockReturnValue('raw-token');

    deliveryService.sendInvitation.mockResolvedValue(undefined);
    config.getOrThrow.mockReturnValue('https://app.example.test');

    worker = new InvitationDeliveryWorker(
      repository as unknown as InvitationDeliveryRepository,
      prisma as unknown as PrismaService,
      security as unknown as InvitationSecurityService,
      deliveryService as unknown as InvitationDeliveryService,
      config as unknown as ConfigService,
    );
  });

  it('returns false when no delivery is available', async () => {
    repository.claimNext.mockResolvedValue(null);

    await expect(worker.processOne()).resolves.toBe(false);

    expect(deliveryService.sendInvitation).not.toHaveBeenCalled();
  });

  it('sends a valid invitation and marks it as sent', async () => {
    await expect(worker.processOne()).resolves.toBe(true);

    expect(deliveryService.sendInvitation).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientEmail: 'owner@example.test',
        activationUrl:
          'https://app.example.test/activate?token=raw-token',
      }),
    );

    expect(repository.markSent).toHaveBeenCalledWith(
      claim.id,
      claim.claimId,
      expect.any(Date),
    );

    expect(repository.markFailed).not.toHaveBeenCalled();
  });

  it('does not send an expired invitation', async () => {
    prisma.invitationDelivery.findUniqueOrThrow.mockResolvedValue({
      ...delivery,
      activationToken: {
        expiresAt: new Date(Date.now() - 60_000),
        consumedAt: null,
      },
    });

    await worker.processOne();

    expect(deliveryService.sendInvitation).not.toHaveBeenCalled();

    expect(repository.markFailed).toHaveBeenCalledWith(
      claim.id,
      claim.claimId,
      expect.any(Date),
      null,
      'ACTIVATION_TOKEN_INVALID',
    );
  });

  it('does not send an already consumed invitation', async () => {
    prisma.invitationDelivery.findUniqueOrThrow.mockResolvedValue({
      ...delivery,
      activationToken: {
        expiresAt: new Date(Date.now() + 60_000),
        consumedAt: new Date(),
      },
    });

    await worker.processOne();

    expect(deliveryService.sendInvitation).not.toHaveBeenCalled();
    expect(repository.markFailed).toHaveBeenCalledWith(
      claim.id,
      claim.claimId,
      expect.any(Date),
      null,
      'ACTIVATION_TOKEN_INVALID',
    );
  });

  it('does not send when encrypted token is missing', async () => {
    prisma.invitationDelivery.findUniqueOrThrow.mockResolvedValue({
      ...delivery,
      encryptedToken: null,
    });

    await worker.processOne();

    expect(deliveryService.sendInvitation).not.toHaveBeenCalled();
    expect(repository.markFailed).toHaveBeenCalledWith(
      claim.id,
      claim.claimId,
      expect.any(Date),
      null,
      'ENCRYPTED_TOKEN_MISSING',
    );
  });

  it('records token decryption failure without sending', async () => {
    security.decryptToken.mockImplementation(() => {
      throw new Error('Decryption failed');
    });

    await worker.processOne();

    expect(deliveryService.sendInvitation).not.toHaveBeenCalled();
    expect(repository.markFailed).toHaveBeenCalledWith(
      claim.id,
      claim.claimId,
      expect.any(Date),
      null,
      'TOKEN_DECRYPTION_FAILED',
    );
  });

  it('schedules a retry when email sending fails', async () => {
    deliveryService.sendInvitation.mockRejectedValue(
      new Error('Provider unavailable'),
    );

    await worker.processOne();

    expect(repository.markSent).not.toHaveBeenCalled();

    expect(repository.markFailed).toHaveBeenCalledWith(
      claim.id,
      claim.claimId,
      expect.any(Date),
      expect.any(Date),
      'EMAIL_SEND_FAILED',
    );

    const call = repository.markFailed.mock.calls[0];

    const failedAt = call[2] as Date;
    const nextAttemptAt = call[3] as Date;

    expect(nextAttemptAt.getTime() - failedAt.getTime()).toBe(
      60_000,
    );
  });


it('does not classify a database failure as an email failure', async () => {
  repository.markSent.mockRejectedValue(
    new Error('Database connection lost'),
  );

  await expect(worker.processOne()).rejects.toThrow(
    'Database connection lost',
  );

  // The provider accepted the email.
  expect(deliveryService.sendInvitation).toHaveBeenCalledTimes(1);

  // Saving SENT failed, but this is not an email failure.
  expect(repository.markFailed).not.toHaveBeenCalled();
});


it('does not mark the invitation as failed when ownership is lost', async () => {
  repository.markSent.mockResolvedValue(false);

  await expect(worker.processOne()).resolves.toBe(true);

  expect(deliveryService.sendInvitation).toHaveBeenCalledTimes(1);

  expect(repository.markSent).toHaveBeenCalledTimes(1);

  expect(repository.markFailed).not.toHaveBeenCalled();
});

});
