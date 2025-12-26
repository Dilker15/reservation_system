import { Test, TestingModule } from '@nestjs/testing';
import { PaymentAccountsController } from './payment_accounts.controller';
import { PaymentAccountsService } from './payment_accounts.service';

describe('PaymentAccountsController', () => {
  let controller: PaymentAccountsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentAccountsController],
      providers: [PaymentAccountsService],
    }).compile();

    controller = module.get<PaymentAccountsController>(PaymentAccountsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
