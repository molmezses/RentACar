import { describe, expect, it } from 'vitest';

import { FakeEmailSender } from './fake-email-sender.service.js';

describe('FakeEmailSender', () => {
  it('accepts an invitation email without sending a real email', async () => {
    const sender = new FakeEmailSender();

    await expect(
      sender.sendInvitation({
        recipientEmail: 'owner@example.test',
        activationUrl: 'https://example.test/activate?token=test',
        expiresAt: new Date('2026-11-11T12:00:00Z'),
      }),
    ).resolves.toBeUndefined();
  });
});