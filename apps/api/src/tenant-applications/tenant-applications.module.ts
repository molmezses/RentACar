import { Module } from '@nestjs/common';
import { TenantApplicationsController } from './tenant-applications.controller.js';
import { TenantApplicationsService } from './tenant-applications.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [TenantApplicationsController],
  providers: [TenantApplicationsService],
})
export class TenantApplicationsModule {}