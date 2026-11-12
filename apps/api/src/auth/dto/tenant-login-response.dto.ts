
import { ApiProperty } from '@nestjs/swagger';

export class TenantLoginResponseDto {
  @ApiProperty({
    description: 'JWT Acces token valid for 15 mins.',
  })
  accessToken!: string;

  @ApiProperty({ 
    description: 'Refresh token used to get new acces Token',
    writeOnly: true,
  })
  refreshToken!: string;

  @ApiProperty({
    example: 'Bearer',
  })
  tokenType!: string;

  @ApiProperty({
    example: 900,
    description: 'Access token validity period (seconds).',
  })
  expiresIn!: number;
}
