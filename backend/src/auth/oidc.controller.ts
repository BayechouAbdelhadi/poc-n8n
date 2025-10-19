import { Controller, Get, Post, Body } from '@nestjs/common';
import { OidcService } from './oidc.service';

@Controller('auth/oidc')
export class OidcController {
  constructor(private readonly oidcService: OidcService) {}

  @Get('.well-known/openid-configuration')
  getOpenIdConfiguration() {
    return this.oidcService.getOpenIdConfiguration();
  }

  @Get('.well-known/jwks.json')
  getJwks() {
    return this.oidcService.getJwks();
  }

  @Get('userinfo')
  getUserInfo() {
    return this.oidcService.getUserInfo();
  }

  @Post('token')
  getToken(@Body() body: any) {
    return this.oidcService.getToken(body);
  }
}