

export interface OAuthTokenResponse {
    providerAccountId: string;
    access_token: string;
    refresh_token?: string;
    expiresIn?: number;
    scope?: string;
    isEnable:boolean;
    type_token:string;
  }