import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'admin@example.com',
    description: "Platform administrator's email",
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'your-password',
    description: "Platform administrator's password",
    writeOnly: true,
    format: 'password',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}