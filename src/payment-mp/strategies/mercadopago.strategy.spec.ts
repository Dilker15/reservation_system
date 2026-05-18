import { MercadoPagoStrategy } from './MercadoPagoStrategy';
import { PROVIDERS } from 'src/common/Interfaces';
import { InternalServerErrorException } from '@nestjs/common';
import { PaymentAccount } from 'src/payment_accounts/entities/payment_account.entity';
import { CreatePaymentData, CreatePreferenceRespone, VerifyPaymentResult } from '../interfaces/create.payment';

describe('MercadoPagoStrategy', () => {
  let strategy: MercadoPagoStrategy;


  const mockCreate = jest.fn();
  const mockGet = jest.fn();

  const mockConfig = {} as any;

  beforeEach(() => {
   
    jest.spyOn<any, any>(require('mercadopago'), 'Preference').mockImplementation(() => ({
      create: mockCreate,
    }));
    jest.spyOn<any, any>(require('mercadopago'), 'Payment').mockImplementation(() => ({
      get: mockGet,
    }));

    strategy = new MercadoPagoStrategy(mockConfig);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const mockPaymentData: CreatePaymentData = {
    items: [{ id: '1', title: 'Test', quantity: 2, unit_price: 50 , name:'P01',description:'Description 1'}],
    reservationId: 'res_123',
    amount: 100,
    provider: PROVIDERS.MP,
    auto_return: 'approved',
    metadata: {},
    notification_url: 'http://notify',
    back_urls: { success: '', failure: '', pending: '' },
    intent_id: 'intent_123',
  };

  const mockAccount: PaymentAccount = {} as any;

  describe('createPayment', () => {
    it('should call Preference.create and return transformed response', async () => {
      const mockResponse = {
        id: 'pref_123',
        init_point: 'https://mp.com/pay',
        external_reference: 'intent_123',
      };
      mockCreate.mockResolvedValue(mockResponse);

      const result: CreatePreferenceRespone = await strategy.createPayment(mockPaymentData, mockAccount);

      expect(mockCreate).toHaveBeenCalledWith({
        body: {
          items: mockPaymentData.items,
          auto_return: 'approved',
          notification_url: 'http://notify',
          metadata: { reservation: 'res_123' },
          back_urls: mockPaymentData.back_urls,
          external_reference: 'intent_123',
        },
      });

      expect(result).toEqual({
        preference_id: 'pref_123',
        url: 'https://mp.com/pay',
        external_reference: 'intent_123',
      });
    });

    it('should throw InternalServerErrorException on error', async () => {
      mockCreate.mockRejectedValue(new Error('fail'));

      await expect(strategy.createPayment(mockPaymentData, mockAccount)).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  describe('verifyPayment', () => {
    it('should return null if payment not approved', async () => {
      const mockPayment = { status: 'pending' };
      mockGet.mockResolvedValue(mockPayment);

      const result = await strategy.verifyPayment('pay_123');
      expect(mockGet).toHaveBeenCalledWith({ id: 'pay_123' });
      expect(result).toBeNull();
    });

    it('should return VerifyPaymentResult if payment approved', async () => {
      const mockPayment = {
        id: 1,
        status: 'approved',
        payer: { email: 'payer@test.com', first_name: 'John', id: 'payer_1' },
        transaction_amount: 100,
        metadata: { reservation_id: 'res_123' },
        payment_type_id: 'credit_card',
        external_reference: 'intent_123',
        currency_id: 'USD',
      };
      mockGet.mockResolvedValue(mockPayment);

      const result = await strategy.verifyPayment('pay_123');

      expect(result).toEqual({
        paymentId: '1',
        provider: PROVIDERS.MP,
        status: 'approved',
        payerEmail: 'payer@test.com',
        payerName: 'John',
        amount: 100,
        reservationId: 'res_123',
        paymentMethod: 'credit_card',
        external_reference: 'intent_123',
        payerId: 'payer_1',
        currency: 'USD',
        feeAmount: 0,
      });
    });
  });


  describe('transformPreferenceResponse', () => {
    it('should transform response correctly', () => {
      const input = { id: 'pref_1', init_point: 'url', external_reference: 'ext_1' };
      const result = (strategy as any).transformPreferenceResponse(input);
      expect(result).toEqual({
        preference_id: 'pref_1',
        url: 'url',
        external_reference: 'ext_1',
      });
    });
  });

  describe('buildPaymentResult', () => {
    it('should map PaymentResponse to VerifyPaymentResult', () => {
      const input = {
        id: 1,
        status: 'approved',
        payer: { email: 'payer@test.com', first_name: 'John', id: 'payer_1' },
        transaction_amount: 100,
        metadata: { reservation_id: 'res_123' },
        payment_type_id: 'credit_card',
        external_reference: 'intent_123',
        currency_id: 'USD',
      };

      const result = (strategy as any).buildPaymentResult(input);
      expect(result).toEqual({
        paymentId: '1',
        provider: PROVIDERS.MP,
        status: 'approved',
        payerEmail: 'payer@test.com',
        payerName: 'John',
        amount: 100,
        reservationId: 'res_123',
        paymentMethod: 'credit_card',
        external_reference: 'intent_123',
        payerId: 'payer_1',
        currency: 'USD',
        feeAmount: 0,
      });
    });
  });
});
