import { OAuthTokenResponse } from "../intefaces/OAuth.interface";


export interface OAuthStrategy{


    generateAuthUrl(state: string): string;
    exchangeCodeForToken(code: string):Promise<OAuthTokenResponse>;

}