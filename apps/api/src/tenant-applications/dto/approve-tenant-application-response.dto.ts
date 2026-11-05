import { ApiProperty } from '@nestjs/swagger';

import { TenantApplicationResponseDto } from './tenant-application-response.dto.js';
import { TenantResponseDto } from './tenant-response.dto.js';

export class ApproveTenantApplicationResponseDto {
  @ApiProperty({
    description: 'Onaylanan şirket başvurusunun bilgileri.',
    type: () => TenantApplicationResponseDto,
  })
  application!: TenantApplicationResponseDto;

  @ApiProperty({
    description: 'Onay sonucunda oluşturulan şirketin bilgileri.',
    type: () => TenantResponseDto,
  })
  tenant!: TenantResponseDto;
}