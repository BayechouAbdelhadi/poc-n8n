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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OidcController = void 0;
const common_1 = require("@nestjs/common");
const oidc_service_1 = require("./oidc.service");
let OidcController = class OidcController {
    constructor(oidcService) {
        this.oidcService = oidcService;
    }
    getOpenIdConfiguration() {
        return this.oidcService.getOpenIdConfiguration();
    }
    getJwks() {
        return this.oidcService.getJwks();
    }
    getUserInfo() {
        return this.oidcService.getUserInfo();
    }
    getToken(body) {
        return this.oidcService.getToken(body);
    }
};
exports.OidcController = OidcController;
__decorate([
    (0, common_1.Get)('.well-known/openid-configuration'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OidcController.prototype, "getOpenIdConfiguration", null);
__decorate([
    (0, common_1.Get)('.well-known/jwks.json'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OidcController.prototype, "getJwks", null);
__decorate([
    (0, common_1.Get)('userinfo'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OidcController.prototype, "getUserInfo", null);
__decorate([
    (0, common_1.Post)('token'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OidcController.prototype, "getToken", null);
exports.OidcController = OidcController = __decorate([
    (0, common_1.Controller)('auth/oidc'),
    __metadata("design:paramtypes", [oidc_service_1.OidcService])
], OidcController);
//# sourceMappingURL=oidc.controller.js.map