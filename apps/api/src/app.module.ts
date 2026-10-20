import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { TenantsModule } from './tenants/tenants.module.js';
import { TenantApplicationsModule } from './tenant-applications/tenant-applications.module.js';

@Module({
  imports: [PrismaModule, TenantsModule, TenantApplicationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}




