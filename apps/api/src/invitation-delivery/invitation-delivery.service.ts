
import { Inject, Injectable } from '@nestjs/common';

import { EMAIL_SENDER } from './email-sender.token.js';
import type {
  EmailSender,
  SendInvitationEmail,
} from './email-sender.interface.js';

@Injectable()
export class InvitationDeliveryService {
  constructor(
    @Inject(EMAIL_SENDER)
    private readonly emailSender: EmailSender,
  ) {}

  async sendInvitation(
    message: SendInvitationEmail,
  ): Promise<void> {
    await this.emailSender.sendInvitation(message);
  }
}
