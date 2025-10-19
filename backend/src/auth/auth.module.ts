import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OidcController } from './oidc.controller';
import { OidcService } from './oidc.service';
import { User } from '../entities/user.entity';
import { Tenant } from '../entities/tenant.entity';
import { RefreshToken } from '../entities/refresh-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Tenant, RefreshToken]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-jwt-secret-must-match-backend-secret-min-32-chars',
      signOptions: {
        expiresIn: process.env.JWT_EXPIRATION || '1h',
      },
    }),
  ],
  controllers: [AuthController, OidcController],
  providers: [AuthService, OidcService],
  exports: [AuthService],
})
export class AuthModule {}