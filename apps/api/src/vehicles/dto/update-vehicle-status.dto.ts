
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { FleetStatus } from '../../../generated/prisma/client.js';

export class UpdateVehicleStatusDto {
  @ApiProperty({
    enum: FleetStatus,
    example: FleetStatus.INACTIVE,
    description: 'Aracın filo durumu: ACTIVE veya INACTIVE',
    enumName: 'FleetStatus',
  })
  @IsEnum(FleetStatus)  //Gelen değerin FleetStatus enumundaki değerlerden biri olup olmadığını kontrol eder
  fleetStatus!: FleetStatus;
  
}
