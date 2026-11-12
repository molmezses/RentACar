import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class TenantRefreshDto {
  @ApiProperty({
    description: 'Giriş sırasında verilen refresh token.',
    writeOnly: true,
  })
  @IsString()
  @Matches(/^[A-Za-z0-9_-]{43}$/, {
    message: 'Geçersiz refresh token formatı.',
  })
  refreshToken!: string;
}
