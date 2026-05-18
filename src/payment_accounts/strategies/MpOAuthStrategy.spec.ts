import { InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { MercadoPagoOAuthStrategy } from "./Mp0AuthStrategy";
import { PROVIDERS, VERSION_APP_URL } from "src/common/Interfaces";
import { OAuthTokenResponse } from "../intefaces/OAuth.interface";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("MercadoPagoOAuthStrategy", () => {
  let strategy: MercadoPagoOAuthStrategy;
  let configService: ConfigService;

  const mockConfig = {
    MERCADO_PAGO_CLIENT_ID: "mp_client_id",
    APP_URL: "https://myapp.com",
  };

  beforeEach(() => {
    configService = { get: jest.fn((key: string) => mockConfig[key]) } as unknown as ConfigService;
    strategy = new MercadoPagoOAuthStrategy(configService);
    jest.clearAllMocks();
  });

  describe("generateAuthUrl", () => {
    it("should generate a valid Mercado Pago authorization URL with state", () => {
      const state = "random-state";
      const url = strategy.generateAuthUrl(state);

      expect(url).toContain("https://auth.mercadopago.com/authorization");
      expect(url).toContain(`client_id=${mockConfig.MERCADO_PAGO_CLIENT_ID}`);
      expect(url).toContain(`redirect_uri=${encodeURIComponent(`${mockConfig.APP_URL}/${VERSION_APP_URL}/payment-accounts/callback/${PROVIDERS.MP}`)}`);
      expect(url).toContain(`state=${state}`);
      expect(url).toContain("response_type=code");
    });
  });

  describe("exchangeCodeForToken", () => {
    const code = "auth-code";
    const tokenResponse = {
      access_token: "access123",
      refresh_token: "refresh123",
      stripe_user_id: "mp_account_123",
      token_type: "bearer",
      scope: "read_write",
    };

    it("should exchange code for token successfully", async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: tokenResponse });

      const result: OAuthTokenResponse = await strategy.exchangeCodeForToken(code);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "https://auth.mercadopago.com/oauth/token",
        {
          client_id: mockConfig.MERCADO_PAGO_CLIENT_ID,
          client_secret: mockConfig.MERCADO_PAGO_CLIENT_ID,
          grant_type: "authorization_code",
          code,
          redirect_uri: mockConfig.APP_URL,
        },
        { headers: { "Content-Type": "application/json" } },
      );

      expect(result).toEqual({
        access_token: tokenResponse.access_token,
        refresh_token: tokenResponse.refresh_token,
        providerAccountId: tokenResponse.stripe_user_id,
        type_token: tokenResponse.token_type,
        scope: tokenResponse.scope,
        isEnable: true,
      });
    });

    it("should throw an error if axios request fails", async () => {
      mockedAxios.post.mockRejectedValueOnce({ response: { data: "error details" } });

      await expect(strategy.exchangeCodeForToken(code))
        .rejects.toThrow("Failed to exchange Mercado Pago code");
    });
  });

  describe("config getters", () => {
    it("should throw InternalServerErrorException if MERCADO_PAGO_CLIENT_ID is missing", () => {
      (configService.get as jest.Mock).mockReturnValueOnce(undefined);
      expect(() => (strategy as any).clientId).toThrow(InternalServerErrorException);
    });

    it("should throw InternalServerErrorException if APP_URL is missing", () => {
      (configService.get as jest.Mock).mockImplementation(key => key === "APP_URL" ? undefined : mockConfig[key]);
      expect(() => (strategy as any).appUrl).toThrow(InternalServerErrorException);
    });
  });
});
