import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEnum,
  IsInt,
  IsString,
  Length,
  Matches,
  Max,
  Min,
  IsOptional,
  MaxLength,
  IsBoolean,
} from "class-validator";
import { Transform } from "class-transformer";

import {
  VehicleCategory,
  Transmission,
  FuelType,
  VehicleCurrency,
} from "../../../generated/prisma/client.js";

function normalizeOptionalMoney(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();

  return trimmed === "" ? null : trimmed;
}

export class CreateVehicleDto {
  @ApiProperty({ example: "34 ABC 123", minLength: 2, maxLength: 20 })
  @Transform(({ value }) =>
    typeof value === "string" ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @Length(2, 20)
  @Matches(/^[\p{L}\p{N} -]+$/u)
  plate!: string;

  @ApiProperty({ example: "Toyota", maxLength: 60 })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @Length(1, 60)
  make!: string;

  @ApiProperty({ example: "Corolla", maxLength: 80 })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @Length(1, 80)
  model!: string;

  @ApiProperty({ example: 2024 })
  @IsInt()
  @Min(1950)
  @Max(new Date().getFullYear() + 1)
  modelYear!: number;

  @ApiProperty({ enum: VehicleCategory, example: VehicleCategory.SEDAN })
  @IsEnum(VehicleCategory)
  category!: VehicleCategory;

  @ApiProperty({ enum: Transmission, example: Transmission.AUTOMATIC })
  @IsEnum(Transmission)
  transmission!: Transmission;

  @ApiProperty({ enum: FuelType, example: FuelType.PETROL })
  @IsEnum(FuelType)
  fuelType!: FuelType;

  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(1)
  @Max(20)
  seatCount!: number;

  @ApiProperty({ example: 45000 })
  @IsInt()
  @Min(0)
  odometerKm!: number;

  @ApiProperty({ example: "1500.00", type: String })
  @IsString()
  @Matches(/^(?!0(?:\.0{1,2})?$)(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/)
  dailyPrice!: string;

  @ApiProperty({ enum: VehicleCurrency, example: VehicleCurrency.TRY })
  @IsEnum(VehicleCurrency)
  currency!: VehicleCurrency;

  // Araç kimlik ve görünüm bilgileri

  @ApiPropertyOptional({ example: "JTDBR32E720123456", nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(17)
  @Matches(/^[A-HJ-NPR-Z0-9]+$/i)
  vin?: string | null;

  @ApiPropertyOptional({ example: "FLEET-001", nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  internalCode?: string | null;

  @ApiPropertyOptional({ example: "Hybrid Premium", nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  trim?: string | null;

  @ApiPropertyOptional({ example: "Beyaz", nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  color?: string | null;

  // Teknik özellikler

  @ApiPropertyOptional({ example: 4, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(8)
  doorCount?: number | null;

  @ApiPropertyOptional({ example: true, nullable: true })
  @IsOptional()
  @IsBoolean()
  hasAirConditioning?: boolean | null;

  // Operasyon bilgileri

  @ApiPropertyOptional({ example: "Kayseri Merkez", nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  currentLocationLabel?: string | null;

  @ApiPropertyOptional({ example: "Yeni bakımdan çıktı.", nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string | null;

  // Fiyatlandırma

  @ApiPropertyOptional({
    example: "3000.00",
    type: String,
    nullable: true,
    description: "Optional deposit amount as a decimal string.",
  })
  @Transform(({ value }) => normalizeOptionalMoney(value))
  @IsOptional()
  @IsString()
  @Matches(/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/)
  depositAmount?: string | null;

  @ApiPropertyOptional({ example: 200, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  includedMileageKm?: number | null;

  @ApiPropertyOptional({
    example: "12.50",
    type: String,
    nullable: true,
    description: "Optional extra kilometer price as a decimal string.",
  })
  @Transform(({ value }) => normalizeOptionalMoney(value))
  @IsOptional()
  @IsString()
  @Matches(/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/)
  extraKmPrice?: string | null;
}
