import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

export type ApplicationStatusFilter =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED';

export class ListTenantApplicationsQueryDto {
  @ApiPropertyOptional({
    description: 'Başvuruları durumuna göre filtreler.',
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    example: 'PENDING',
  })
  @IsOptional()
  @IsIn(['PENDING', 'APPROVED', 'REJECTED'])
  status?: ApplicationStatusFilter;
}