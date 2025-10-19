"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tenant = void 0;
var typeorm_1 = require("typeorm");
var Tenant = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('tenants'), (0, typeorm_1.Index)(['domain'], { unique: true, where: 'domain IS NOT NULL' })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _name_decorators;
    var _name_initializers = [];
    var _name_extraInitializers = [];
    var _domain_decorators;
    var _domain_initializers = [];
    var _domain_extraInitializers = [];
    var _plan_decorators;
    var _plan_initializers = [];
    var _plan_extraInitializers = [];
    var _n8nDatabaseSchema_decorators;
    var _n8nDatabaseSchema_initializers = [];
    var _n8nDatabaseSchema_extraInitializers = [];
    var _maxWorkflows_decorators;
    var _maxWorkflows_initializers = [];
    var _maxWorkflows_extraInitializers = [];
    var _maxExecutionsPerMonth_decorators;
    var _maxExecutionsPerMonth_initializers = [];
    var _maxExecutionsPerMonth_extraInitializers = [];
    var _maxUsers_decorators;
    var _maxUsers_initializers = [];
    var _maxUsers_extraInitializers = [];
    var _storageLimitBytes_decorators;
    var _storageLimitBytes_initializers = [];
    var _storageLimitBytes_extraInitializers = [];
    var _isActive_decorators;
    var _isActive_initializers = [];
    var _isActive_extraInitializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _createdAt_extraInitializers = [];
    var _updatedAt_decorators;
    var _updatedAt_initializers = [];
    var _updatedAt_extraInitializers = [];
    var _deletedAt_decorators;
    var _deletedAt_initializers = [];
    var _deletedAt_extraInitializers = [];
    var Tenant = _classThis = /** @class */ (function () {
        function Tenant_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.name = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _name_initializers, void 0));
            this.domain = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _domain_initializers, void 0));
            this.plan = (__runInitializers(this, _domain_extraInitializers), __runInitializers(this, _plan_initializers, void 0));
            this.n8nDatabaseSchema = (__runInitializers(this, _plan_extraInitializers), __runInitializers(this, _n8nDatabaseSchema_initializers, void 0));
            this.maxWorkflows = (__runInitializers(this, _n8nDatabaseSchema_extraInitializers), __runInitializers(this, _maxWorkflows_initializers, void 0));
            this.maxExecutionsPerMonth = (__runInitializers(this, _maxWorkflows_extraInitializers), __runInitializers(this, _maxExecutionsPerMonth_initializers, void 0));
            this.maxUsers = (__runInitializers(this, _maxExecutionsPerMonth_extraInitializers), __runInitializers(this, _maxUsers_initializers, void 0));
            this.storageLimitBytes = (__runInitializers(this, _maxUsers_extraInitializers), __runInitializers(this, _storageLimitBytes_initializers, void 0));
            this.isActive = (__runInitializers(this, _storageLimitBytes_extraInitializers), __runInitializers(this, _isActive_initializers, void 0));
            this.createdAt = (__runInitializers(this, _isActive_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            this.updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
            this.deletedAt = (__runInitializers(this, _updatedAt_extraInitializers), __runInitializers(this, _deletedAt_initializers, void 0));
            __runInitializers(this, _deletedAt_extraInitializers);
        }
        return Tenant_1;
    }());
    __setFunctionName(_classThis, "Tenant");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _name_decorators = [(0, typeorm_1.Column)({ name: 'name' })];
        _domain_decorators = [(0, typeorm_1.Column)({ name: 'domain', nullable: true, unique: true })];
        _plan_decorators = [(0, typeorm_1.Column)({ name: 'plan', default: 'free' })];
        _n8nDatabaseSchema_decorators = [(0, typeorm_1.Column)({ name: 'n8n_database_schema', nullable: true })];
        _maxWorkflows_decorators = [(0, typeorm_1.Column)({ name: 'max_workflows', default: 10 })];
        _maxExecutionsPerMonth_decorators = [(0, typeorm_1.Column)({ name: 'max_executions_per_month', default: 1000 })];
        _maxUsers_decorators = [(0, typeorm_1.Column)({ name: 'max_users', default: 5 })];
        _storageLimitBytes_decorators = [(0, typeorm_1.Column)({ name: 'storage_limit_bytes', type: 'bigint', default: 1073741824 })];
        _isActive_decorators = [(0, typeorm_1.Column)({ name: 'is_active', default: true })];
        _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)({ name: 'created_at' })];
        _updatedAt_decorators = [(0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' })];
        _deletedAt_decorators = [(0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at', nullable: true })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: function (obj) { return "name" in obj; }, get: function (obj) { return obj.name; }, set: function (obj, value) { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
        __esDecorate(null, null, _domain_decorators, { kind: "field", name: "domain", static: false, private: false, access: { has: function (obj) { return "domain" in obj; }, get: function (obj) { return obj.domain; }, set: function (obj, value) { obj.domain = value; } }, metadata: _metadata }, _domain_initializers, _domain_extraInitializers);
        __esDecorate(null, null, _plan_decorators, { kind: "field", name: "plan", static: false, private: false, access: { has: function (obj) { return "plan" in obj; }, get: function (obj) { return obj.plan; }, set: function (obj, value) { obj.plan = value; } }, metadata: _metadata }, _plan_initializers, _plan_extraInitializers);
        __esDecorate(null, null, _n8nDatabaseSchema_decorators, { kind: "field", name: "n8nDatabaseSchema", static: false, private: false, access: { has: function (obj) { return "n8nDatabaseSchema" in obj; }, get: function (obj) { return obj.n8nDatabaseSchema; }, set: function (obj, value) { obj.n8nDatabaseSchema = value; } }, metadata: _metadata }, _n8nDatabaseSchema_initializers, _n8nDatabaseSchema_extraInitializers);
        __esDecorate(null, null, _maxWorkflows_decorators, { kind: "field", name: "maxWorkflows", static: false, private: false, access: { has: function (obj) { return "maxWorkflows" in obj; }, get: function (obj) { return obj.maxWorkflows; }, set: function (obj, value) { obj.maxWorkflows = value; } }, metadata: _metadata }, _maxWorkflows_initializers, _maxWorkflows_extraInitializers);
        __esDecorate(null, null, _maxExecutionsPerMonth_decorators, { kind: "field", name: "maxExecutionsPerMonth", static: false, private: false, access: { has: function (obj) { return "maxExecutionsPerMonth" in obj; }, get: function (obj) { return obj.maxExecutionsPerMonth; }, set: function (obj, value) { obj.maxExecutionsPerMonth = value; } }, metadata: _metadata }, _maxExecutionsPerMonth_initializers, _maxExecutionsPerMonth_extraInitializers);
        __esDecorate(null, null, _maxUsers_decorators, { kind: "field", name: "maxUsers", static: false, private: false, access: { has: function (obj) { return "maxUsers" in obj; }, get: function (obj) { return obj.maxUsers; }, set: function (obj, value) { obj.maxUsers = value; } }, metadata: _metadata }, _maxUsers_initializers, _maxUsers_extraInitializers);
        __esDecorate(null, null, _storageLimitBytes_decorators, { kind: "field", name: "storageLimitBytes", static: false, private: false, access: { has: function (obj) { return "storageLimitBytes" in obj; }, get: function (obj) { return obj.storageLimitBytes; }, set: function (obj, value) { obj.storageLimitBytes = value; } }, metadata: _metadata }, _storageLimitBytes_initializers, _storageLimitBytes_extraInitializers);
        __esDecorate(null, null, _isActive_decorators, { kind: "field", name: "isActive", static: false, private: false, access: { has: function (obj) { return "isActive" in obj; }, get: function (obj) { return obj.isActive; }, set: function (obj, value) { obj.isActive = value; } }, metadata: _metadata }, _isActive_initializers, _isActive_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: function (obj) { return "updatedAt" in obj; }, get: function (obj) { return obj.updatedAt; }, set: function (obj, value) { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
        __esDecorate(null, null, _deletedAt_decorators, { kind: "field", name: "deletedAt", static: false, private: false, access: { has: function (obj) { return "deletedAt" in obj; }, get: function (obj) { return obj.deletedAt; }, set: function (obj, value) { obj.deletedAt = value; } }, metadata: _metadata }, _deletedAt_initializers, _deletedAt_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Tenant = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Tenant = _classThis;
}();
exports.Tenant = Tenant;
