import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateTenantDto {


  @ApiProperty({
    example: 'Test RentACar',
    description: 'Name of the car rental company',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({
  example: 'test-rentacar',
  description: 'Unique URL-friendly identifier of the company',
  pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$',
})
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must contain only lowercase letters, numbers and hyphens',
  })
  slug!: string;
}
