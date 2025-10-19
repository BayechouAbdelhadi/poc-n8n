"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tenant = void 0;
const typeorm_1 = require("typeorm");
let Tenant = class Tenant {
};
exports.Tenant = Tenant;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Tenant.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'name', nullable: true }),
    __metadata("design:type", String)
], Tenant.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'domain', nullable: true, unique: true }),
    __metadata("design:type", String)
], Tenant.prototype, "domain", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'plan', default: 'free' }),
    __metadata("design:type", String)
], Tenant.prototype, "plan", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'n8n_database_schema', nullable: true }),
    __metadata("design:type", String)
], Tenant.prototype, "n8nDatabaseSchema", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_workflows', default: 10 }),
    __metadata("design:type", Number)
], Tenant.prototype, "maxWorkflows", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_executions_per_month', default: 1000 }),
    __metadata("design:type", Number)
], Tenant.prototype, "maxExecutionsPerMonth", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_users', default: 5 }),
    __metadata("design:type", Number)
], Tenant.prototype, "maxUsers", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'storage_limit_bytes', type: 'bigint', default: 1073741824 }),
    __metadata("design:type", String)
], Tenant.prototype, "storageLimitBytes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], Tenant.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Tenant.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Tenant.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at', nullable: true }),
    __metadata("design:type", Date)
], Tenant.prototype, "deletedAt", void 0);
exports.Tenant = Tenant = __decorate([
    (0, typeorm_1.Entity)('tenants'),
    (0, typeorm_1.Index)(['domain'], { unique: true, where: 'domain IS NOT NULL' })
], Tenant);
//# sourceMappingURL=tenant.entity.js.map