
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

import type {
  EmailSender,
  SendInvitationEmail,
} from './email-sender.interface.js';

@Injectable()
export class SmtpEmailSender implements EmailSender {
  private readonly transporter: ReturnType<
    typeof nodemailer.createTransport
  >;

  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    const host = this.config.getOrThrow<string>('SMTP_HOST');

    const port = Number(
      this.config.getOrThrow<string>('SMTP_PORT'),
    );

    this.from = this.config.getOrThrow<string>('SMTP_FROM');

    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error('Invalid SMTP_PORT.');
    }

    const localTestMode =
      this.config.get<string>('SMTP_LOCAL_TEST_MODE') === 'true';

    if (localTestMode) {
      if (
        process.env.NODE_ENV === 'production' ||
        !['localhost', '127.0.0.1', '::1'].includes(host) ||
        port !== 1025
      ) {
        throw new Error(
          'SMTP_LOCAL_TEST_MODE is only allowed for local Mailpit.',
        );
      }

      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: false,
        ignoreTLS: true,
        connectionTimeout: 10_000,
        socketTimeout: 20_000,
      });

      return;
    }

    const user = this.config.getOrThrow<string>('SMTP_USER');
    const password = this.config.getOrThrow<string>(
      'SMTP_PASSWORD',
    );

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      requireTLS: port !== 465,
      auth: {
        user,
        pass: password,
      },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });
  }

  async sendInvitation(
    message: SendInvitationEmail,
  ): Promise<void> {
    const result = await this.transporter.sendMail({
      from: this.from,
      to: message.recipientEmail,
      subject: 'RentACar - Şirket Yönetici Hesabı Aktivasyonu',
      text: [
        'Merhaba,',
        '',
        'RentACar şirket yönetici hesabınız oluşturuldu.',
        'Hesabınızı etkinleştirmek için aşağıdaki bağlantıyı kullanın:',
        '',
        message.activationUrl,
        '',
        `Bağlantının son geçerlilik tarihi: ${message.expiresAt.toISOString()}`,
        '',
        'Bu işlemi siz başlatmadıysanız e-postayı dikkate almayabilirsiniz.',
      ].join('\n'),
    });

    if (
      result.rejected.length > 0 ||
      !result.accepted.includes(message.recipientEmail)
    ) {
      throw new Error('SMTP_RECIPIENT_REJECTED');
    }
  }
}
