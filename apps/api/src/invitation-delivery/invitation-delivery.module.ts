
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from '../prisma/prisma.module.js';
import { InvitationSecurityModule } from '../invitation-security/invitation-security.module.js';

import { EMAIL_SENDER } from './email-sender.token.js';
import { SmtpEmailSender } from './smtp-email-sender.service.js';
import { InvitationDeliveryRepository } from './invitation-delivery.repository.js';
import { InvitationDeliveryService } from './invitation-delivery.service.js';
import { InvitationDeliveryWorker } from './invitation-delivery.worker.js';
import { InvitationDeliveryScheduler } from './invitation-delivery.scheduler.js';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    InvitationSecurityModule,
  ],
  providers: [
    InvitationDeliveryRepository,
    InvitationDeliveryService,
    InvitationDeliveryWorker,
    InvitationDeliveryScheduler,
    {
      provide: EMAIL_SENDER,
      useClass: SmtpEmailSender,
    },
  ],
})
export class InvitationDeliveryModule {}
