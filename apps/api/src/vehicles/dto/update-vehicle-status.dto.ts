
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { FleetStatus } from '../../../generated/prisma/client.js';

export class UpdateVehicleStatusDto {
  @ApiProperty({
    description: 'Aracın yeni filo durumu',
    enum: FleetStatus,
    example: FleetStatus.INACTIVE,
  })
  @IsEnum(FleetStatus)  //Gelen değerin FleetStatus enumundaki değerlerden biri olup olmadığını kontrol eder
  fleetStatus!: FleetStatus;
  
}
