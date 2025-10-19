import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
            tenant: import("../entities/tenant.entity").Tenant;
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
            tenant: import("../entities/tenant.entity").Tenant;
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
    logout(req: any): Promise<void>;
    verify(req: any): Promise<{
        user: any;
    }>;
}
