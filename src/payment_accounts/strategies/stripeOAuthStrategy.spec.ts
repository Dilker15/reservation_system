import { InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { StripeOAuthStrategy } from './Stripe0AuthStrategy';
import { PROVIDERS, VERSION_APP_URL } from 'src/common/Interfaces';
import { OAuthTokenResponse } from '../intefaces/OAuth.interface';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

    describe('StripeOAuthStrategy', () => {
    let strategy: StripeOAuthStrategy;
    let configService: ConfigService;

    const mockConfig = {
        STRIPE_CLIENT_ID: 'test_client_id',
        STRIPE_SECRET_KEY: 'test_secret_key',
        APP_URL: 'https://testapp.com',
    };

    beforeEach(() => {
        configService = { get: jest.fn((key: string) => mockConfig[key]) } as unknown as ConfigService;
        strategy = new StripeOAuthStrategy(configService);
        jest.clearAllMocks();
    });

    describe('generateAuthUrl', () => {
        it('should generate a valid Stripe authorization URL with state', () => {
        const state = 'random-state';
        const url = strategy.generateAuthUrl(state);

        expect(url).toContain('https://connect.stripe.com/oauth/authorize');
        expect(url).toContain(`client_id=${mockConfig.STRIPE_CLIENT_ID}`);
        expect(url).toContain(`redirect_uri=${encodeURIComponent(`${mockConfig.APP_URL}/${VERSION_APP_URL}/payment-accounts/callback/${PROVIDERS.STRIPE}`)}`);
        expect(url).toContain(`state=${state}`);
        expect(url).toContain('response_type=code');
        expect(url).toContain('scope=read_write');
        });
    });

    describe('exchangeCodeForToken', () => {
        const code = 'auth-code';
        const tokenResponse = {
        access_token: 'access123',
        refresh_token: 'refresh123',
        stripe_user_id: 'acct_123',
        token_type: 'bearer',
        scope: 'read_write',
        };

        it('should exchange code for token successfully', async () => {
        mockedAxios.post.mockResolvedValueOnce({ data: tokenResponse });

        const result: OAuthTokenResponse = await strategy.exchangeCodeForToken(code);

        expect(mockedAxios.post).toHaveBeenCalledWith(
            'https://connect.stripe.com/oauth/token',
            expect.stringContaining(`client_id=${mockConfig.STRIPE_CLIENT_ID}`),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
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

        it('should throw InternalServerErrorException on axios failure', async () => {
        mockedAxios.post.mockRejectedValueOnce({ response: { data: 'error details' } });

        await expect(strategy.exchangeCodeForToken(code))
            .rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('config getters', () => {
        it('should throw InternalServerErrorException if STRIPE_CLIENT_ID is missing', () => {
        (configService.get as jest.Mock).mockReturnValueOnce(undefined);
        expect(() => (strategy as any).clientId).toThrow(InternalServerErrorException);
        });

        it('should throw InternalServerErrorException if STRIPE_SECRET_KEY is missing', () => {
        (configService.get as jest.Mock).mockImplementation(key => key === 'STRIPE_SECRET_KEY' ? undefined : mockConfig[key]);
        expect(() => (strategy as any).clientSecret).toThrow(InternalServerErrorException);
        });

        it('should throw InternalServerErrorException if APP_URL is missing', () => {
        (configService.get as jest.Mock).mockImplementation(key => key === 'APP_URL' ? undefined : mockConfig[key]);
        expect(() => (strategy as any).appUrl).toThrow(InternalServerErrorException);
        });
    });
    });
