import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TenantsModule } from './tenants/tenants.module';
import { WorkflowsModule } from './workflows/workflows.module';
import { User } from './entities/user.entity';
import { Tenant } from './entities/tenant.entity';
import { RefreshToken } from './entities/refresh-token.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'postgres',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'saas_db',
      entities: [User, Tenant, RefreshToken],
      synchronize: true,
      logging: false,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'your-jwt-secret-must-match-backend-secret-min-32-chars',
      signOptions: {
        expiresIn: process.env.JWT_EXPIRATION || '1h',
      },
    }),
    AuthModule,
    UsersModule,
    TenantsModule,
    WorkflowsModule,
  ],
})
export class AppModule {}