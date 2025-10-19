export declare class OidcService {
    getOpenIdConfiguration(): {
        issuer: string;
        authorization_endpoint: string;
        token_endpoint: string;
        userinfo_endpoint: string;
        jwks_uri: string;
        response_types_supported: string[];
        subject_types_supported: string[];
        id_token_signing_alg_values_supported: string[];
    };
    getJwks(): {
        keys: any[];
    };
    getUserInfo(): {
        sub: string;
        name: string;
        email: string;
    };
    getToken(body: any): {
        access_token: string;
        token_type: string;
        expires_in: number;
    };
}
