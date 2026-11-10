
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ActivateTenantAdminDto {
  @ApiProperty({
    description: 'E-posta ile gönderilen aktivasyon tokenı',
  })
  @IsString()
  @Matches(/^[A-Za-z0-9_-]{43}$/, {
    message: 'Geçersiz aktivasyon tokenı formatı.',
  })
  token!: string;

  @ApiProperty({
    description: 'Şirket yöneticisinin belirleyeceği yeni şifre',
    minLength: 12,
    maxLength: 128,
    writeOnly: true,
  })
  @IsString()
  @MinLength(12)
  @MaxLength(128)
  password!: string;
}
