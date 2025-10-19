"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const user_entity_1 = require("../entities/user.entity");
const tenant_entity_1 = require("../entities/tenant.entity");
const refresh_token_entity_1 = require("../entities/refresh-token.entity");
const config_1 = require("@nestjs/config");
let AuthService = class AuthService {
    constructor(usersRepository, tenantsRepository, refreshTokensRepository, jwtService, configService) {
        this.usersRepository = usersRepository;
        this.tenantsRepository = tenantsRepository;
        this.refreshTokensRepository = refreshTokensRepository;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async register(registerDto) {
        const { email, password, firstName, lastName, tenantName } = registerDto;
        const existingUser = await this.usersRepository.findOne({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const tenant = this.tenantsRepository.create({
            name: tenantName || `${firstName || email}'s Organization`,
            plan: 'free',
        });
        await this.tenantsRepository.save(tenant);
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = this.usersRepository.create({
            email,
            passwordHash: hashedPassword,
            firstName,
            lastName,
            tenantId: tenant.id,
            emailVerified: false,
        });
        await this.usersRepository.save(user);
        const tokens = await this.generateTokens(user, tenant.id);
        return {
            user: this.sanitizeUser(user),
            ...tokens,
        };
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.usersRepository.findOne({
            where: { email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Account is deactivated');
        }
        user.lastLoginAt = new Date();
        await this.usersRepository.save(user);
        const tokens = await this.generateTokens(user, user.tenantId);
        return {
            user: this.sanitizeUser(user),
            ...tokens,
        };
    }
    async refreshToken(refreshToken) {
        const tokenRecord = await this.refreshTokensRepository.findOne({
            where: { token: refreshToken },
            relations: ['user'],
        });
        if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
        const tokens = await this.generateTokens(tokenRecord.user, tokenRecord.user.tenantId);
        await this.refreshTokensRepository.remove(tokenRecord);
        return tokens;
    }
    async logout(userId) {
        await this.refreshTokensRepository.delete({ userId });
    }
    async validateUser(userId) {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
        });
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException('User not found or inactive');
        }
        return user;
    }
    async generateTokens(user, tenantId) {
        const payload = {
            sub: user.id,
            email: user.email,
            tenant_id: tenantId,
            roles: [],
            n8n_user_id: user.n8nUserId,
        };
        const jwtSecret = this.configService.get('JWT_SECRET') || process.env.JWT_SECRET;
        const jwtExpiration = this.configService.get('JWT_EXPIRATION') || process.env.JWT_EXPIRATION || '15m';
        const apiUrl = process.env.API_URL || 'http://api.saas.local';
        const issuer = apiUrl + '/auth/oidc';
        console.log('JWT Generation - API_URL:', apiUrl, 'Issuer:', issuer);
        const accessToken = this.jwtService.sign(payload, {
            secret: jwtSecret,
            expiresIn: jwtExpiration,
            issuer: issuer,
        });
        const refreshTokenValue = this.jwtService.sign({ sub: user.id, type: 'refresh' }, {
            secret: jwtSecret,
            expiresIn: '7d',
        });
        const refreshToken = this.refreshTokensRepository.create({
            token: refreshTokenValue,
            userId: user.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        await this.refreshTokensRepository.save(refreshToken);
        return {
            accessToken,
            refreshToken: refreshTokenValue,
            expiresIn: 900,
        };
    }
    sanitizeUser(user) {
        const { passwordHash, ...sanitized } = user;
        return sanitized;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __param(2, (0, typeorm_1.InjectRepository)(refresh_token_entity_1.RefreshToken)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map