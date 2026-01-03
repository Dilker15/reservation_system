import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuthStrategy } from './0AuthStrategy';
import { OAuthTokenResponse } from "../intefaces/OAuth.interface";
import { PROVIDERS, VERSION_APP_URL } from 'src/common/Interfaces';
import axios from 'axios'


@Injectable()
export class StripeOAuthStrategy implements OAuthStrategy {
    private readonly AUTH_BASE_URL = 'https://connect.stripe.com/oauth';
    private readonly FORM_HEADERS = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    constructor(
      private readonly configService: ConfigService,
    ) {}


    generateAuthUrl(state: string): string {
      const params = new URLSearchParams({
        response_type: 'code',
        client_id: this.clientId,
        scope: 'read_write',
        redirect_uri: this.callbackUrl,
        state,
      });

      return `${this.AUTH_BASE_URL}/authorize?${params.toString()}`;
    }

    async exchangeCodeForToken(code: string): Promise<OAuthTokenResponse> {
      try {
        const params = new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'authorization_code',
          code,
        });

        const { data } = await axios.post(`${this.AUTH_BASE_URL}/token`,params.toString(),
          { headers: this.FORM_HEADERS },
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
        console.error(
          'Stripe exchange token error:',
          error.response?.data || error.message,
        );
        throw new InternalServerErrorException(
          'Error exchanging Stripe code for token',
        );
      }
    }

    private get callbackUrl(): string {
      return `${this.appUrl}/${VERSION_APP_URL}/payment-accounts/callback/${PROVIDERS.STRIPE}`;
    }

    private get clientId(): string {
      return this.getConfig('STRIPE_CLIENT_ID');
    }

    private get clientSecret(): string {
      return this.getConfig('STRIPE_SECRET_KEY');
    }

    private get appUrl(): string {
      return this.getConfig('APP_URL');
    }

    private getConfig(key: string): string {
      const value = this.configService.get<string>(key);
      if (!value) {
        throw new InternalServerErrorException(`${key} not found`);
      }
      return value;
    }
}
