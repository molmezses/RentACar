import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { TenantsModule } from './tenants/tenants.module.js';

@Module({
  imports: [PrismaModule, TenantsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}




