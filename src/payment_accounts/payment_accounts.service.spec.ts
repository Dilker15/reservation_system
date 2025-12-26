import { Test, TestingModule } from '@nestjs/testing';
import { PaymentAccountsService } from './payment_accounts.service';

describe('PaymentAccountsService', () => {
  let service: PaymentAccountsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentAccountsService],
    }).compile();

    service = module.get<PaymentAccountsService>(PaymentAccountsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
