import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Tenant } from '../entities/tenant.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
export declare class AuthService {
    private usersRepository;
    private tenantsRepository;
    private refreshTokensRepository;
    private jwtService;
    private configService;
    constructor(usersRepository: Repository<User>, tenantsRepository: Repository<Tenant>, refreshTokensRepository: Repository<RefreshToken>, jwtService: JwtService, configService: ConfigService);
    register(registerDto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        user: {
            id: string;
            email: string;
            firstName?: string;
            lastName?: string;
            tenantId: string;
            tenant: Tenant;
            n8nUserId?: number;
            isActive: boolean;
            emailVerified: boolean;
            emailVerifiedAt?: Date;
            lastLoginAt?: Date;
            createdAt: Date;
            updatedAt: Date;
            deletedAt?: Date;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        user: {
            id: string;
            email: string;
            firstName?: string;
            lastName?: string;
            tenantId: string;
            tenant: Tenant;
            n8nUserId?: number;
            isActive: boolean;
            emailVerified: boolean;
            emailVerifiedAt?: Date;
            lastLoginAt?: Date;
            createdAt: Date;
            updatedAt: Date;
            deletedAt?: Date;
        };
    }>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    }>;
    logout(userId: string): Promise<void>;
    validateUser(userId: string): Promise<User>;
    private generateTokens;
    private sanitizeUser;
}
