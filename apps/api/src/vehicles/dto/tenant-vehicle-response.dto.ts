import { ApiProperty } from '@nestjs/swagger';
import {
  VehicleCategory,
  Transmission,
  FuelType,
  VehicleCurrency,
  FleetStatus,
} from '../../../generated/prisma/client.js';

export class TenantVehicleResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: '34 ABC 123' })
  plate!: string;

  @ApiProperty({ example: 'Toyota' })
  make!: string;

  @ApiProperty({ example: 'Corolla' })
  model!: string;

  @ApiProperty({ example: 2024 })
  modelYear!: number;

  @ApiProperty({ enum: VehicleCategory })
  category!: VehicleCategory;

  @ApiProperty({ enum: Transmission })
  transmission!: Transmission;

  @ApiProperty({ enum: FuelType })
  fuelType!: FuelType;

  @ApiProperty({ example: 5 })
  seatCount!: number;

  @ApiProperty({ example: 45000 })
  odometerKm!: number;

  @ApiProperty({
    type: String,
    example: '1500.00',
  })
  dailyPrice!: string;

  @ApiProperty({ enum: VehicleCurrency })
  currency!: VehicleCurrency;

  @ApiProperty({
    type: String,
    nullable: true,
    example: '3000.00',
  })
  depositAmount!: string | null;

  @ApiProperty({
    type: Number,
    nullable: true,
    example: 200,
  })
  includedMileageKm!: number | null;

  @ApiProperty({
    type: String,
    nullable: true,
    example: '12.50',
  })
  extraKmPrice!: string | null;

  @ApiProperty({ enum: FleetStatus })
  fleetStatus!: FleetStatus;

  @ApiProperty({
    description: 'Aracın pasifleştirildiği tarih',
    type: String,
    format: 'date-time',
    nullable: true,
    example: '2026-11-25T16:00:00.000Z'
  })
  deactivatedAt!: string | null;

  @ApiProperty({ type: String, nullable: true })
  vin!: string | null;

  @ApiProperty({ type: String, nullable: true })
  internalCode!: string | null;

  @ApiProperty({ type: String, nullable: true })
  trim!: string | null;

  @ApiProperty({ type: Number, nullable: true })
  doorCount!: number | null;

  @ApiProperty({ type: String, nullable: true })
  currentLocationLabel!: string | null;

  @ApiProperty({ type: String, nullable: true })
  notes!: string | null;

  @ApiProperty({ type: Boolean, nullable: true })
  hasAirConditioning!: boolean | null;

  @ApiProperty({
    type: String,
    format: 'date-time',
  })
  createdAt!: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
  })
  updatedAt!: string;
}
