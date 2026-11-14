import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { TenantsController } from './tenants.controller.js';
import { TenantsService } from './tenants.service.js';
import { AuthModule } from '../auth/auth.module.js';

import { TenantProfileController } from './tenant-profile.controller.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [TenantsController, TenantProfileController],
  providers: [TenantsService]
})
export class TenantsModule {
  
}
