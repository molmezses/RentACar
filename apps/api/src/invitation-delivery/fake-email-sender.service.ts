import { Injectable } from '@nestjs/common';

import type {
  EmailSender,
  SendInvitationEmail,
} from './email-sender.interface.js';

@Injectable()
export class FakeEmailSender implements EmailSender {
  async sendInvitation(
    _message: SendInvitationEmail,
  ): Promise<void> {
    return Promise.resolve();
  }
}