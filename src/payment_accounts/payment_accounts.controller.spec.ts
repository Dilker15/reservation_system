import { Test, TestingModule } from '@nestjs/testing';
import { PaymentAccountsController } from './payment_accounts.controller';
import { PaymentAccountsService } from './payment_accounts.service';
import { BadRequestException } from '@nestjs/common';
import { PROVIDERS, Roles } from 'src/common/Interfaces';
import { User } from 'src/users/entities/user.entity';

describe('PaymentAccountsController', () => {
  let controller: PaymentAccountsController;
  let service: PaymentAccountsService;

  const mockUser: User = {
    id: 'user_1',
    email: 'owner@mail.com',
    role: Roles.OWNER,
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentAccountsController],
      providers: [
        {
          provide: PaymentAccountsService,
          useValue: {
            createUrlAuth: jest.fn(),
            exchangeCodeForToken: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(PaymentAccountsController);
    service = module.get(PaymentAccountsService);
  });

  describe('redirectToProvider', () => {
    it('should return oauth url from service', async () => {
      const url = 'https://provider/oauth';

      jest.spyOn(service, 'createUrlAuth').mockImplementation(() => Promise.resolve(url));

        const result = await Promise.resolve(
          controller.redirectToProvider(PROVIDERS.MP, mockUser),
        );

        expect(service.createUrlAuth).toHaveBeenCalledWith(
          mockUser,
          PROVIDERS.MP,
        );
        expect(result).toBe(url);
    });

  describe('callbackOAuth', () => {
    it('should throw if provider returns error', async () => {
      await expect(
        controller.callbackOAuth('mp', undefined, undefined, 'access_denied'),
      ).rejects.toThrow(
        new BadRequestException('mp authorization failed'),
      );
    });

    it('should throw if code or state is missing', async () => {
      await expect(
        controller.callbackOAuth('mp', 'code_123', undefined),
      ).rejects.toThrow(
        new BadRequestException('Missing code or state'),
      );
    });

    it('should throw if provider is not supported', async () => {
      await expect(
        controller.callbackOAuth('unknown', 'code_123', 'state_123'),
      ).rejects.toThrow(
        new BadRequestException('Unsupported provider'),
      );
    });

    it('should exchange code and return success response', async () => {
          jest
            .spyOn(service, 'exchangeCodeForToken')
            .mockResolvedValue(undefined);

          const providerParam = PROVIDERS.MP.toLowerCase();

          const result = await controller.callbackOAuth(
            providerParam,
            'code_123',
            'state_123',
          );

          expect(service.exchangeCodeForToken).toHaveBeenCalledWith(
            'state_123',
            PROVIDERS.MP,
            'code_123',
          );

          expect(result).toEqual({
            success: true,
            message: `${PROVIDERS.MP} account connected successfully`,
          });
        });

  });
})});
