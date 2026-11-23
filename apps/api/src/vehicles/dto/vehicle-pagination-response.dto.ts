import { ApiProperty } from '@nestjs/swagger';

export class VehiclePaginationResponseDto {
  @ApiProperty({
    description: 'Geçerli sayfa numarası',
    example: 1,
  })
  page!: number;

  @ApiProperty({
    description: 'Sayfa başına kayıt sayısı',
    example: 20,
  })
  limit!: number;

  @ApiProperty({
    description: 'Filtrelerle eşleşen toplam araç sayısı',
    example: 85,
  })
  total!: number;

  @ApiProperty({
    description: 'Toplam sayfa sayısı',
    example: 5,
  })
  totalPages!: number;
}