import { ApiProperty } from '@nestjs/swagger';

import { TenantVehicleResponseDto } from './tenant-vehicle-response.dto.js';
import { VehiclePaginationResponseDto } from './vehicle-pagination-response.dto.js';

export class VehicleListResponseDto {
  @ApiProperty({
    type: () => TenantVehicleResponseDto,
    isArray: true,
    description: 'İlgili sayfadaki araçlar',
  })
  items!: TenantVehicleResponseDto[];

  @ApiProperty({
    type: () => VehiclePaginationResponseDto,
    description: 'Sayfalama bilgileri',
  })
  pagination!: VehiclePaginationResponseDto;
}