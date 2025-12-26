import { Injectable } from "@nestjs/common";
import { OAuthTokenResponse } from "../intefaces/OAuth.interface";
import { OAuthStrategy } from "./0AuthStrategy";
import { ConfigService } from "@nestjs/config";



@Injectable()
export class MercadoPagoOAuthStrategy implements OAuthStrategy{

    private readonly OAUTH_URL = 'https://auth.mercadopago.com/authorization';

    constructor(private readonly confServ:ConfigService){

    }
    
    generateAuthUrl(state: string): string {
        const params = new URLSearchParams({
            response_type: 'code',
            client_id:this.confServ.get<string>('MERCADO_PAGO_CLIENT_ID')!,
            redirect_uri:`${this.confServ.get<string>('APP_URL')}/payment-accounts/callback/mercado-pago`,
            state,
          });
          return `${this.OAUTH_URL}?${params.toString()}`;
    }

    exchangeCodeForToken(code: string): Promise<OAuthTokenResponse> {
        throw new Error("Method not implemented.");
    }

}