import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module.js';
import { VehiclesController } from './vehicles.controller.js';
import { VehiclesService } from './vehicles.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [PrismaModule , AuthModule],
  controllers: [VehiclesController],
  providers: [VehiclesService],
})
export class VehiclesModule {}