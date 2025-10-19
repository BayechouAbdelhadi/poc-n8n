export declare class Tenant {
    id: string;
    name?: string;
    domain?: string;
    plan: string;
    n8nDatabaseSchema?: string;
    maxWorkflows: number;
    maxExecutionsPerMonth: number;
    maxUsers: number;
    storageLimitBytes: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
