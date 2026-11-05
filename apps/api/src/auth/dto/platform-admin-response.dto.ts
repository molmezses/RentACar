import { ApiProperty } from '@nestjs/swagger';

export class PlatformAdminResponseDto {
  @ApiProperty({
    description: 'Platform yöneticisinin benzersiz kimliği.',
    example: 'cm1234567890abcdef',
  })
  id!: string;

  @ApiProperty({
    description: 'Platform yöneticisinin e-posta adresi.',
    example: 'admin@example.com',
  })
  email!: string;
}