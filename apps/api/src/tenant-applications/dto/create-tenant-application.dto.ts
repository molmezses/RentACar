import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateTenantApplicationDto {
  @ApiProperty({ example: 'Mustafa RentACar' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  companyName!: string;

  @ApiProperty({ example: 'mustafa-rentacar' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must contain only lowercase letters, numbers and hyphens',
  })
  slug!: string;

  @ApiProperty({ example: 'Mustafa Ölmezses' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  contactName!: string;

  @ApiProperty({ example: 'mustafa@example.com' })
  @IsEmail()
  contactEmail!: string;

  @ApiProperty({ example: '+905321234567' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{7,14}$/, {
    message: 'contactPhone must use international format, e.g. +905321234567',
  })
  contactPhone!: string;
}