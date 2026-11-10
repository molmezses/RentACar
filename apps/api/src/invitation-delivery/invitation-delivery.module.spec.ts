
import { describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';

import { EMAIL_SENDER } from './email-sender.token.js';
import { InvitationDeliveryService } from './invitation-delivery.service.js';
import { SmtpEmailSender } from './smtp-email-sender.service.js';

describe('InvitationDelivery dependency injection', () => {
  it('resolves the EMAIL_SENDER provider to SmtpEmailSender', async () => {
    const values: Record<string, string> = {
      SMTP_HOST: 'smtp.example.test',
      SMTP_PORT: '587',
      SMTP_USER: 'test-user',
      SMTP_PASSWORD: 'test-password',
      SMTP_FROM: 'RentACar <no-reply@example.test>',
      SMTP_LOCAL_TEST_MODE: 'false',
    };

    const config = {
      get: vi.fn((key: string) => values[key]),

      getOrThrow: vi.fn((key: string) => {
        const value = values[key];

        if (value === undefined) {
          throw new Error(`Missing configuration: ${key}`);
        }

        return value;
      }),
    };

    const module = await Test.createTestingModule({
      providers: [
        InvitationDeliveryService,
        {
          provide: EMAIL_SENDER,
          useClass: SmtpEmailSender,
        },
        {
          provide: ConfigService,
          useValue: config,
        },
      ],
    }).compile();

    try {
      const sender = module.get<SmtpEmailSender>(EMAIL_SENDER);
      const service = module.get(InvitationDeliveryService);

      expect(sender).toBeInstanceOf(SmtpEmailSender);
      expect(service).toBeInstanceOf(InvitationDeliveryService);
    } finally {
      await module.close();
    }
  });
});
