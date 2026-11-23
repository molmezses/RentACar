import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  IsEnum,
  IsIn,
} from 'class-validator';

import {
  VehicleCategory,
  FleetStatus,
  Transmission,
  FuelType,
} from '../../../generated/prisma/client.js';

export class ListVehiclesQueryDto {
  @ApiPropertyOptional({
    description: 'Sayfa numarası',
    example: 1,
    default: 1,
    minimum: 1,
    type: Number,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Sayfa başına araç sayısı',
    example: 20,
    default: 20,
    minimum: 1,
    maximum: 100,
    type: Number,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @ApiPropertyOptional({
    description: 'Plaka, marka veya modele göre arama',
    example: 'Toyota',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({ enum: VehicleCategory })
  @IsOptional()
  @IsEnum(VehicleCategory)
  category?: VehicleCategory;

  @ApiPropertyOptional({ enum: FleetStatus })
  @IsOptional()
  @IsEnum(FleetStatus)
  fleetStatus?: FleetStatus;

  @ApiPropertyOptional({ enum: Transmission })
  @IsOptional()
  @IsEnum(Transmission)
  transmission?: Transmission;

  @ApiPropertyOptional({ enum: FuelType })
  @IsOptional()
  @IsEnum(FuelType)
  fuelType?: FuelType;

  @ApiPropertyOptional({
    description: 'Araçların sıralanacağı alan',
    enum: ['createdAt', 'make', 'model', 'plate', 'dailyPrice'],
    default: 'createdAt',
  })
  @IsIn(['createdAt', 'make', 'model', 'plate', 'dailyPrice'])
  sortBy:
  | 'createdAt'
  | 'make'
  | 'model'
  | 'plate'
  | 'dailyPrice' = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sıralama yönü',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'desc';
}
