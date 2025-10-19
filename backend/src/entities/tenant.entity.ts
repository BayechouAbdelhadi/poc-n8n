import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

@Entity('tenants')
@Index(['domain'], { unique: true, where: 'domain IS NOT NULL' })
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name', nullable: true })
  name?: string;

  @Column({ name: 'domain', nullable: true, unique: true })
  domain?: string;

  @Column({ name: 'plan', default: 'free' })
  plan: string;

  @Column({ name: 'n8n_database_schema', nullable: true })
  n8nDatabaseSchema?: string;

  @Column({ name: 'max_workflows', default: 10 })
  maxWorkflows: number;

  @Column({ name: 'max_executions_per_month', default: 1000 })
  maxExecutionsPerMonth: number;

  @Column({ name: 'max_users', default: 5 })
  maxUsers: number;

  @Column({ name: 'storage_limit_bytes', type: 'bigint', default: 1073741824 }) // 1GB default
  storageLimitBytes: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;
}
