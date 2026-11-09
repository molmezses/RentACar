
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { InvitationSecurityService } from './invitation-security.service.js';

@Module({
  imports: [ConfigModule],
  providers: [InvitationSecurityService],
  exports: [InvitationSecurityService],
})
export class InvitationSecurityModule {}
