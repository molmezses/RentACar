
import { describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';

import { EMAIL_SENDER } from './email-sender.token.js';
import { InvitationDeliveryService } from './invitation-delivery.service.js';
import type { EmailSender } from './email-sender.interface.js';

describe('InvitationDeliveryService', () => {
  it('injects the email sender and delegates invitation sending', async () => {
    const sendInvitationMock = vi.fn().mockResolvedValue(undefined);

    const fakeSender: EmailSender = {
      sendInvitation: sendInvitationMock,
    };

    const module = await Test.createTestingModule({
      providers: [
        InvitationDeliveryService,
        {
          provide: EMAIL_SENDER,
          useValue: fakeSender,
        },
      ],
    }).compile();

    try {
      const service = module.get(InvitationDeliveryService);

      const message = {
        recipientEmail: 'owner@example.test',
        activationUrl: 'https://example.test/activate?token=test',
        expiresAt: new Date('2026-11-11T12:00:00Z'),
      };

      await service.sendInvitation(message);

      expect(sendInvitationMock).toHaveBeenCalledExactlyOnceWith(
        message,
      );
    } finally {
      await module.close();
    }
  });
});
