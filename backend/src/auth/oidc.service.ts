import { Injectable } from '@nestjs/common';

@Injectable()
export class OidcService {
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
    // Return empty JWKS for now - in production, this should return actual public keys
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

  getToken(body: any) {
    return {
      access_token: 'mock-access-token',
      token_type: 'Bearer',
      expires_in: 3600,
    };
  }
}