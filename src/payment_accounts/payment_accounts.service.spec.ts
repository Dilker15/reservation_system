import { Test, TestingModule } from '@nestjs/testing';
import { PaymentAccountsService } from './payment_accounts.service';
import { OAuthFactory } from './strategies/StrategyOAuthFactory';
import { OAuthStrategy } from './strategies/0AuthStrategy';
import { TokenEncrytionService } from 'src/token-encrytion/token-encrytion.service';
import { StatesService } from './strategies/states.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PaymentAccount } from './entities/payment_account.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { PROVIDERS } from 'src/common/Interfaces';
import { InternalServerErrorException } from '@nestjs/common';

describe('PaymentAccountsService', () => {
  let service: PaymentAccountsService;
  let repo: Repository<PaymentAccount>;
  let strategyFactory: OAuthFactory;
  let stateService: StatesService;
  let tokenEncryptService: TokenEncrytionService;

  const mockUser = { id: 1 } as any;
  const mockStrategy: Partial<OAuthStrategy> = {
    generateAuthUrl: jest.fn(),
    exchangeCodeForToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentAccountsService,
        {
          provide: OAuthFactory,
          useValue: { getStrategy: jest.fn(() => mockStrategy) },
        },
        {
          provide: StatesService,
          useValue: {
            create: jest.fn(),
            validate: jest.fn(),
          },
        },
        {
          provide: TokenEncrytionService,
          useValue: { encrypt: jest.fn((val) => `encrypted-${val}`) },
        },
        {
          provide: getRepositoryToken(PaymentAccount),
          useValue: { save: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<PaymentAccountsService>(PaymentAccountsService);
    repo = module.get<Repository<PaymentAccount>>(getRepositoryToken(PaymentAccount));
    strategyFactory = module.get<OAuthFactory>(OAuthFactory);
    stateService = module.get<StatesService>(StatesService);
    tokenEncryptService = module.get<TokenEncrytionService>(TokenEncrytionService);
  });

  describe('createUrlAuth', () => {
    it('should create a state and return auth URL', async () => {
      (stateService.create as jest.Mock).mockResolvedValue('state123');
      (mockStrategy.generateAuthUrl as jest.Mock).mockReturnValue('https://provider/oauth');

      const result = await service.createUrlAuth(mockUser, PROVIDERS.MP);

      expect(stateService.create).toHaveBeenCalledWith(mockUser.id);
      expect(strategyFactory.getStrategy).toHaveBeenCalledWith(PROVIDERS.MP);
      expect(mockStrategy.generateAuthUrl).toHaveBeenCalledWith('state123');
      expect(result).toBe('https://provider/oauth');
    });

    it('should throw InternalServerErrorException if strategy fails', async () => {
      (stateService.create as jest.Mock).mockRejectedValue(new Error('fail'));

      await expect(service.createUrlAuth(mockUser, PROVIDERS.MP)).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  describe('exchangeCodeForToken', () => {
    const mockData = {
      access_token: 'access123',
      refresh_token: 'refresh123',
      providerAccountId: 'prov123',
      type_token: 'Bearer',
    };

    it('should validate state, exchange code and save payment account', async () => {
      (stateService.validate as jest.Mock).mockResolvedValue(mockUser.id);
      (mockStrategy.exchangeCodeForToken as jest.Mock).mockResolvedValue(mockData);
      (repo.save as jest.Mock).mockResolvedValue({});

      await service.exchangeCodeForToken('state123', PROVIDERS.MP, 'code456');

      expect(stateService.validate).toHaveBeenCalledWith('state123');
      expect(strategyFactory.getStrategy).toHaveBeenCalledWith(PROVIDERS.MP);
      expect(mockStrategy.exchangeCodeForToken).toHaveBeenCalledWith('code456');
      expect(tokenEncryptService.encrypt).toHaveBeenCalledWith('access123');
      expect(tokenEncryptService.encrypt).toHaveBeenCalledWith('refresh123');
      expect(repo.save).toHaveBeenCalledWith({
        access_token: 'encrypted-access123',
        refresh_token: 'encrypted-refresh123',
        admin: { id: mockUser.id },
        provider: PROVIDERS.MP,
        provider_account_id: 'prov123',
        token_type: 'Bearer',
      });
    });

    it('should throw InternalServerErrorException if anything fails', async () => {
      (stateService.validate as jest.Mock).mockRejectedValue(new Error('fail'));

      await expect(
        service.exchangeCodeForToken('state123', PROVIDERS.MP, 'code456'),
      ).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });
});
