import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

import { InvitationSecurityModule } from '../invitation-security/invitation-security.module.js';
import { TenantAdminActivationService } from './tenant-admin-activation.service.js';

@Module({
  imports: [
    PrismaModule,
    InvitationSecurityModule,
    ConfigModule.forRoot({
      envFilePath: '../../.env',
    }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '15m',
          algorithm: 'HS256',
        },
        verifyOptions: {
          algorithms: ['HS256'],
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService , JwtAuthGuard, TenantAdminActivationService],
  exports: [JwtAuthGuard, JwtModule],
})
export class AuthModule {}