import { ApiProperty } from '@nestjs/swagger';

//Login başarılı olduğunda API nin döndürdüğü verilerin yapısını Swaggerda belgelememizi sağlar
export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT erişim tokenı.',
    type: String,
  })
  accessToken!: string;

  @ApiProperty({
    description: 'Token türü.',
    example: 'Bearer',
  })
  tokenType!: string;

  @ApiProperty({
    description: 'Tokenın geçerlilik süresi (saniye).',
    example: 900,
  })
  expiresIn!: number;
}