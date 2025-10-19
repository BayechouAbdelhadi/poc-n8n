import { Tenant } from './tenant.entity';
export declare class User {
    id: string;
    email: string;
    passwordHash: string;
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
}
