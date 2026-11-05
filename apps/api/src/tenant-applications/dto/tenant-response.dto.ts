import { ApiProperty } from '@nestjs/swagger';
//Onaylanan başvuru sonucunda oluşturulan Tenant'ın alanlarını Swagger'da belgeler
export class TenantResponseDto {
  @ApiProperty({
    description: 'Tenant benzersiz kimliği.',
    example: 'cm1234567890abcdef',
  })
  id!: string;

  @ApiProperty({
    description: 'Şirket adı.',
    example: 'Eda RentACar',
  })
  name!: string;

  @ApiProperty({
    description: 'Şirketin benzersiz slug değeri.',
    example: 'eda-rentacar',
  })
  slug!: string;

  @ApiProperty({
    description: 'Tenant durumu.',
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    example: 'APPROVED',
  })
  status!: 'PENDING' | 'APPROVED' | 'REJECTED';

  @ApiProperty({
    description: 'Tenant oluşturulma zamanı.',
    type: String,
    format: 'date-time',
    example: '2026-11-05T10:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Tenant son güncellenme zamanı.',
    type: String,
    format: 'date-time',
    example: '2026-11-05T10:00:00.000Z',
  })
  updatedAt!: Date;
}