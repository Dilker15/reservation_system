import { Injectable } from "@nestjs/common";
import { OAuthTokenResponse } from "../intefaces/OAuth.interface";
import { OAuthStrategy } from "./0AuthStrategy";




@Injectable()
export class StripeOAuthStrategy implements OAuthStrategy{


    generateAuthUrl(state: string): string {
        return "STRIPEURL";
    }



    exchangeCodeForToken(code: string): Promise<OAuthTokenResponse> {
        throw new Error("Method not implemented.");
    }


}