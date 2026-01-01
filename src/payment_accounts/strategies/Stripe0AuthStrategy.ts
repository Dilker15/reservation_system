import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuthStrategy } from './0AuthStrategy';
import { OAuthTokenResponse } from "../intefaces/OAuth.interface";
import { PROVIDERS, VERSION_APP_URL } from 'src/common/Interfaces';
import axios from 'axios'
import * as crypto from 'crypto';

@Injectable()
export class StripeOAuthStrategy implements OAuthStrategy {

  private readonly STRIPE_AUTH_URL = 'https://connect.stripe.com/oauth';

  constructor(private readonly configService: ConfigService) {}


  generateAuthUrl(state:string): string {
    const clientId = this.configService.get<string>('STRIPE_CLIENT_ID');

    if (!clientId) {
      throw new InternalServerErrorException('STRIPE_CLIENT_ID not found');
    }
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      scope: 'read_write',
      redirect_uri: this.generateCallbackUrl(),
      state,
    });

    return `${this.STRIPE_AUTH_URL}/authorize?${params.toString()}`;
  }


    async exchangeCodeForToken(code: string): Promise<OAuthTokenResponse> {
    try {
      const params = new URLSearchParams({
        client_secret: this.configService.get<string>('STRIPE_SECRET_KEY')!,
        code,
        grant_type: 'authorization_code',
        client_id: this.configService.get<string>('STRIPE_CLIENT_ID')!,
      });
    
      const { data } = await axios.post(this.STRIPE_AUTH_URL+'/token', params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return {
        access_token:data.access_token,
        refresh_token:data.refresh_token,
        providerAccountId:data.stripe_user_id,
        type_token:data.token_type,
        scope:data.scope,
        isEnable:true,
      }
    } catch (error) {
      console.error('Stripe exchange token error:', error.response?.data ?? error);
      throw new InternalServerErrorException('Error exchanging Stripe code for token');
    }
  }




    generateCallbackUrl(): string {
      const appUrl = this.configService.get<string>('APP_URL');

      if (!appUrl) {
        throw new InternalServerErrorException('APP_URL not found');
      }

      return `${appUrl}/${VERSION_APP_URL}/payment-accounts/callback/${PROVIDERS.STRIPE}`;
    }
    
}
