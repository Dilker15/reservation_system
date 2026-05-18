import { Test, TestingModule } from '@nestjs/testing';
import { PaymentAccountsController } from './payment_accounts.controller';
import { PaymentAccountsService } from './payment_accounts.service';
import { PROVIDERS, Roles } from 'src/common/Interfaces';
import { User } from 'src/users/entities/user.entity';
import { DisconnectPaymentAccountDto } from './dto/disconnect-payment-account.dto';
import { IdempotencyInterceptor } from 'src/common/interceptors/idempotency.interceptor';

describe('PaymentAccountsController', () => {
  let controller: PaymentAccountsController;
  let service: jest.Mocked<PaymentAccountsService>;

  const mockUser: User = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'owner@test.com',
    role: Roles.OWNER,
  } as User;

  const mockPaymentAccountsService = {
    getConnectedAccounts: jest.fn(),
    createUrlAuth: jest.fn(),
    exchangeCodeForToken: jest.fn(),
    disconnect: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    process.env.FRONT_END_URL = 'http://localhost:3000';

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentAccountsController],
      providers: [
        {
          provide: PaymentAccountsService,
          useValue: mockPaymentAccountsService,
        },
      ],
    })
      .overrideInterceptor(IdempotencyInterceptor)
      .useValue({
        intercept: jest.fn((context, next) => next.handle()),
      })
      .compile();

    controller = module.get<PaymentAccountsController>(
      PaymentAccountsController,
    );

    service = module.get(
      PaymentAccountsService,
    ) as jest.Mocked<PaymentAccountsService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAccounts', () => {

    it('should return connected accounts successfully', async () => {

      const accounts = [
        {
          id: 'acc_1',
          provider: PROVIDERS.MP,
          is_active: true,
        },
        {
          id: 'acc_2',
          provider: PROVIDERS.STRIPE,
          is_active: true,
        },
      ];

      service.getConnectedAccounts.mockResolvedValue(accounts as any);

      const result = await controller.getAccounts(mockUser);

      expect(service.getConnectedAccounts).toHaveBeenCalledTimes(1);

      expect(service.getConnectedAccounts).toHaveBeenCalledWith(
        mockUser,
      );

      expect(result).toEqual(accounts);
    });

    it('should propagate service errors', async () => {

      service.getConnectedAccounts.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        controller.getAccounts(mockUser),
      ).rejects.toThrow('Database error');
    });

  });

  describe('redirectToProvider', () => {

    it('should create oauth url successfully', async () => {

      const response = {
        url: 'https://provider.com/oauth',
      };

      service.createUrlAuth.mockResolvedValue(response as any);

      const result = await controller.redirectToProvider(
        PROVIDERS.MP,
        mockUser,
      );

      expect(service.createUrlAuth).toHaveBeenCalledTimes(1);

      expect(service.createUrlAuth).toHaveBeenCalledWith(
        mockUser,
        PROVIDERS.MP,
      );

      expect(result).toEqual(response);
    });

    it('should propagate service exceptions', async () => {

      service.createUrlAuth.mockRejectedValue(
        new Error('OAuth provider unavailable'),
      );

      await expect(
        controller.redirectToProvider(
          PROVIDERS.STRIPE,
          mockUser,
        ),
      ).rejects.toThrow('OAuth provider unavailable');
    });

  });

  describe('callbackOAuth', () => {

    let mockResponse: any;

    beforeEach(() => {

      mockResponse = {
        redirect: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    });

    it('should redirect to frontend error page when provider returns error', async () => {

      await controller.callbackOAuth(
        PROVIDERS.MP,
        mockResponse,
        undefined,
        undefined,
        'access_denied',
      );

      expect(
        service.exchangeCodeForToken,
      ).not.toHaveBeenCalled();

      expect(mockResponse.redirect).toHaveBeenCalledTimes(1);

      expect(mockResponse.redirect).toHaveBeenCalledWith(
        'http://localhost:3000/error?reason=access_denied',
      );
    });

    it('should redirect when code is missing', async () => {

      await controller.callbackOAuth(
        PROVIDERS.MP,
        mockResponse,
        undefined,
        'state_123',
        undefined,
      );

      expect(
        service.exchangeCodeForToken,
      ).not.toHaveBeenCalled();

      expect(mockResponse.redirect).toHaveBeenCalledWith(
        'http://localhost:3000/error?reason=missing_params',
      );
    });

    it('should redirect when state is missing', async () => {

      await controller.callbackOAuth(
        PROVIDERS.MP,
        mockResponse,
        'code_123',
        undefined,
        undefined,
      );

      expect(
        service.exchangeCodeForToken,
      ).not.toHaveBeenCalled();

      expect(mockResponse.redirect).toHaveBeenCalledWith(
        'http://localhost:3000/error?reason=missing_params',
      );
    });

    it('should exchange code and redirect successfully', async () => {

      service.exchangeCodeForToken.mockResolvedValue(undefined);

      await controller.callbackOAuth(
        PROVIDERS.STRIPE,
        mockResponse,
        'code_123',
        'state_123',
        undefined,
      );

      expect(
        service.exchangeCodeForToken,
      ).toHaveBeenCalledTimes(1);

      expect(
        service.exchangeCodeForToken,
      ).toHaveBeenCalledWith(
        'state_123',
        PROVIDERS.STRIPE,
        'code_123',
      );

      expect(mockResponse.redirect).toHaveBeenCalledWith(
        'http://localhost:3000/dashboard/connectAccounts',
      );
    });

    it('should propagate exchange token errors', async () => {

      service.exchangeCodeForToken.mockRejectedValue(
        new Error('Token exchange failed'),
      );

      await expect(
        controller.callbackOAuth(
          PROVIDERS.STRIPE,
          mockResponse,
          'code_123',
          'state_123',
          undefined,
        ),
      ).rejects.toThrow('Token exchange failed');

      expect(
        service.exchangeCodeForToken,
      ).toHaveBeenCalledTimes(1);
    });

  });

  describe('disconnectAccount', () => {

    it('should disconnect payment account successfully', async () => {

      const dto: DisconnectPaymentAccountDto = {
        password: '123456',
      };

      const response = {
        success: true,
        message: 'Account disconnected successfully',
      };

      service.disconnect.mockResolvedValue(response as any);

      const result = await controller.disconnectAccount(
        '550e8400-e29b-41d4-a716-446655440000',
        mockUser,
        dto,
      );

      expect(service.disconnect).toHaveBeenCalledTimes(1);

      expect(service.disconnect).toHaveBeenCalledWith(
        '550e8400-e29b-41d4-a716-446655440000',
        dto,
        mockUser,
      );

      expect(result).toEqual(response);
    });

    it('should propagate disconnect errors', async () => {

      const dto: DisconnectPaymentAccountDto = {
        password: 'wrong-password',
      };

      service.disconnect.mockRejectedValue(
        new Error('Invalid password'),
      );

      await expect(
        controller.disconnectAccount(
          '550e8400-e29b-41d4-a716-446655440000',
          mockUser,
          dto,
        ),
      ).rejects.toThrow('Invalid password');

      expect(service.disconnect).toHaveBeenCalledTimes(1);
    });

  });

});