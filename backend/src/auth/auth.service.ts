import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { Tenant } from '../entities/tenant.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>,
    @InjectRepository(RefreshToken)
    private refreshTokensRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName, tenantName } = registerDto;

    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create tenant for the user
    const tenant = this.tenantsRepository.create({
      name: tenantName || `${firstName || email}'s Organization`,
      plan: 'free',
    });
    await this.tenantsRepository.save(tenant);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = this.usersRepository.create({
      email,
      passwordHash: hashedPassword,
      firstName,
      lastName,
      tenantId: tenant.id,
      emailVerified: false,
    });

    await this.usersRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(user, tenant.id);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user with tenant
    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Update last login
    user.lastLoginAt = new Date();
    await this.usersRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(user, user.tenantId);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    // Verify refresh token
    const tokenRecord = await this.refreshTokensRepository.findOne({
      where: { token: refreshToken },
      relations: ['user'],
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Generate new tokens
    const tokens = await this.generateTokens(
      tokenRecord.user,
      tokenRecord.user.tenantId,
    );

    // Invalidate old refresh token
    await this.refreshTokensRepository.remove(tokenRecord);

    return tokens;
  }

  async logout(userId: string) {
    // Remove all refresh tokens for this user
    await this.refreshTokensRepository.delete({ userId });
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }

  private async generateTokens(user: User, tenantId: string) {
    const payload = {
      sub: user.id,
      email: user.email,
      tenant_id: tenantId,
      roles: [],
      n8n_user_id: user.n8nUserId,
    };

    const jwtSecret = this.configService.get<string>('JWT_SECRET') || process.env.JWT_SECRET;
    const jwtExpiration = this.configService.get<string>('JWT_EXPIRATION') || process.env.JWT_EXPIRATION || '15m';
    const apiUrl = process.env.API_URL || 'http://api.saas.local';
    const issuer = apiUrl + '/auth/oidc';

    console.log('JWT Generation - API_URL:', apiUrl, 'Issuer:', issuer);

    // Generate access token
    const accessToken = this.jwtService.sign(payload, {
      secret: jwtSecret,
      expiresIn: jwtExpiration,
      issuer: issuer,
    });

    // Generate refresh token
    const refreshTokenValue = this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      {
        secret: jwtSecret,
        expiresIn: '7d',
      },
    );

    // Save refresh token
    const refreshToken = this.refreshTokensRepository.create({
      token: refreshTokenValue,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
    await this.refreshTokensRepository.save(refreshToken);

    return {
      accessToken,
      refreshToken: refreshTokenValue,
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  private sanitizeUser(user: User) {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }
}
