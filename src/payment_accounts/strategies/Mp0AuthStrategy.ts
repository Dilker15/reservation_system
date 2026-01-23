import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { OAuthTokenResponse } from "../intefaces/OAuth.interface";
import { OAuthStrategy } from "./0AuthStrategy";
import { ConfigService } from "@nestjs/config";
import { PROVIDERS, VERSION_APP_URL } from "src/common/Interfaces";
import axios from "axios";

@Injectable()
export class MercadoPagoOAuthStrategy implements OAuthStrategy {
  private readonly AUTH_BASE_URL = 'https://auth.mercadopago.com';
  private readonly JSON_HEADERS = { 'Content-Type': 'application/json' };

  constructor(
    private readonly configService: ConfigService,
  ) {}


    generateAuthUrl(state: string): string {
        const params = new URLSearchParams({
        response_type: 'code',
        client_id: this.clientId,
        redirect_uri: this.callbackUrl,
        state,
        });

        return `${this.AUTH_BASE_URL}/authorization?${params.toString()}`;
    }

  async exchangeCodeForToken(code: string): Promise<OAuthTokenResponse> {
    try {
      const { data } = await axios.post(
        `${this.AUTH_BASE_URL}/oauth/token`,
        this.buildTokenBody(code),
        { headers: this.JSON_HEADERS },
      );

      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        providerAccountId: data.stripe_user_id,
        type_token: data.token_type,
        scope: data.scope,
        isEnable: true,
      };
    } catch (error: any) {
      throw new Error('Failed to exchange Mercado Pago code');
    }
  }


    private buildTokenBody(code: string) {
        return {
        client_id: this.clientId,
        client_secret: this.clientId,
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.appUrl,
        };
    }

    private get callbackUrl(): string {
        return `${this.appUrl}/${VERSION_APP_URL}/payment-accounts/callback/${PROVIDERS.MP}`;
    }

    private get clientId(): string {
        return this.getConfig('MERCADO_PAGO_CLIENT_ID');
    }

    private get appUrl(): string {
        return this.getConfig('APP_URL');
    }

    private getConfig(key: string): string {
        const value = this.configService.get<string>(key);
        if (!value) {
        throw new InternalServerErrorException(`${key} KEY not found`);
        }
        return value;
    }
}
