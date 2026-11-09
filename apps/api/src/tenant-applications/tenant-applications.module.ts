import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';

import { AdminTenantApplicationsController } from './admin-tenant-applications.controller.js';
import { TenantApplicationsController } from './tenant-applications.controller.js';
import { TenantApplicationsService } from './tenant-applications.service.js';

import { InvitationSecurityModule } from '../invitation-security/invitation-security.module.js';

@Module({
  imports: [PrismaModule, AuthModule , InvitationSecurityModule],
  controllers: [
    TenantApplicationsController,
    AdminTenantApplicationsController,
  ],
  providers: [TenantApplicationsService],
})
export class TenantApplicationsModule {}