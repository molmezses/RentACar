import { ApiProperty } from '@nestjs/swagger';
//PostgreSQL'deki TenantApplication kaydının API üzerinden döndürdüğü alanları, türleri ve örnek değerleri Swagger'da tanımlıyor.
export class TenantApplicationResponseDto {
  @ApiProperty({
    description: 'Başvurunun benzersiz kimliği.',
    example: 'cm1234567890abcdef',
  })
  id!: string;

  @ApiProperty({
    description: 'Başvuran şirketin adı.',
    example: 'Eda RentACar',
  })
  companyName!: string;

  @ApiProperty({
    description: 'Başvuran şirketin slug değeri.',
    example: 'eda-rentacar',
  })
  slug!: string;

  @ApiProperty({
    description: 'İletişim kişisinin adı.',
    example: 'Eda Demir',
  })
  contactName!: string;

  @ApiProperty({
    description: 'İletişim e-posta adresi.',
    example: 'eda@example.com',
  })
  contactEmail!: string;

  @ApiProperty({
    description: 'İletişim telefon numarası.',
    example: '+905321234567',
  })
  contactPhone!: string;

  @ApiProperty({
    description: 'Başvurunun mevcut durumu.',
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    example: 'PENDING',
  })
  status!: 'PENDING' | 'APPROVED' | 'REJECTED';

  @ApiProperty({
    description: 'Onay sonrası ilişkilendirilen Tenant kimliği.',
    type: String,
    nullable: true,
    example: null,
  })
  tenantId!: string | null;

  @ApiProperty({
    description: 'Başvurunun oluşturulma zamanı.',
    type: String,
    format: 'date-time',
    example: '2026-11-05T10:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Başvurunun son güncellenme zamanı.',
    type: String,
    format: 'date-time',
    example: '2026-11-05T10:00:00.000Z',
  })
  updatedAt!: Date;
}