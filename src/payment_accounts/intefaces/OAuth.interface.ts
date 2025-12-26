

export interface OAuthTokenResponse {
    providerAccountId: string;
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
    scope?: string;
  }