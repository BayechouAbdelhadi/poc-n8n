"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OidcService = void 0;
const common_1 = require("@nestjs/common");
let OidcService = class OidcService {
    getOpenIdConfiguration() {
        const baseUrl = process.env.API_URL || 'http://api.saas.local';
        return {
            issuer: `${baseUrl}/auth/oidc`,
            authorization_endpoint: `${baseUrl}/auth/oidc/authorize`,
            token_endpoint: `${baseUrl}/auth/oidc/token`,
            userinfo_endpoint: `${baseUrl}/auth/oidc/userinfo`,
            jwks_uri: `${baseUrl}/auth/oidc/.well-known/jwks.json`,
            response_types_supported: ['code', 'id_token', 'token'],
            subject_types_supported: ['public'],
            id_token_signing_alg_values_supported: ['RS256'],
        };
    }
    getJwks() {
        return {
            keys: [],
        };
    }
    getUserInfo() {
        return {
            sub: 'user-id',
            name: 'User Name',
            email: 'user@example.com',
        };
    }
    getToken(body) {
        return {
            access_token: 'mock-access-token',
            token_type: 'Bearer',
            expires_in: 3600,
        };
    }
};
exports.OidcService = OidcService;
exports.OidcService = OidcService = __decorate([
    (0, common_1.Injectable)()
], OidcService);
//# sourceMappingURL=oidc.service.js.map