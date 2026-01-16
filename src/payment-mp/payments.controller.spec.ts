
import { Test, TestingModule } from '@nestjs/testing';
import { PaymentMpController } from './payments.controller';
import { PaymentService } from './services/payment.service';
import { PROVIDERS } from 'src/common/Interfaces';


jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));


describe('PaymentMpController', () => {
  let controller: PaymentMpController;
  let mockPaymentService: Partial<jest.Mocked<PaymentService>>;


  beforeEach(async () => {
    jest.clearAllMocks();

    mockPaymentService = {
      createPayment: jest.fn(),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [PaymentMpController],
      providers: [
        {
          provide: PaymentService,
          useValue: mockPaymentService,
        },
      ],
    }).compile();

    controller = moduleRef.get<PaymentMpController>(PaymentMpController);
  });


  it('should create a payment with reservation id and provider', async () => {
    const reservationId = '550e8400-e29b-41d4-a716-446655440000';
    const provider = PROVIDERS.MP;

    const expectedResult = {
      checkoutUrl: 'https://payment.url',
    } as any;

    mockPaymentService.createPayment!.mockResolvedValue(expectedResult);

    const result = await controller.createPayment(reservationId, provider);

    expect(mockPaymentService.createPayment).toHaveBeenCalledWith(
      reservationId,
      provider,
    );

    expect(result).toEqual(expectedResult);
  });
});
