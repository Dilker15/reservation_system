import { InternalServerErrorException } from '@nestjs/common';
import Stripe from 'stripe';
import { StripeStrategy } from './StripeStrategy';
import { PROVIDERS } from 'src/common/Interfaces';
import { PaymentAccount } from 'src/payment_accounts/entities/payment_account.entity';

describe('StripeStrategy', () => {
  let strategy: StripeStrategy;

  let stripeMock: {
    checkout: {
      sessions: {
        create: jest.Mock;
      };
    };
    paymentIntents: {
      retrieve: jest.Mock;
    };
  };

  beforeEach(() => {
    stripeMock = {
      checkout: {
        sessions: {
          create: jest.fn(),
        },
      },
      paymentIntents: {
        retrieve: jest.fn(),
      },
    };

    strategy = new StripeStrategy(stripeMock as unknown as Stripe);
  });

  describe('createPayment', () => {
    const paymentAccount: PaymentAccount = {
      provider_account_id: 'acct_123',
    } as PaymentAccount;

    const createPaymentData = {
      currency: 'usd',
      reservationId: 'res_123',
      intent_id: 'intent_123',
      back_urls: {
        success: 'https://success.com',
        failure: 'https://failure.com',
      },
      items: [
        {
          title: 'Test product',
          unit_price: 1500,
          quantity: 2,
        },
      ],
    };

    it('should create a Stripe checkout session', async () => {
      stripeMock.checkout.sessions.create.mockResolvedValue({
        id: 'sess_123',
        url: 'https://stripe-session',
        metadata: {
          external_id: 'intent_123',
        },
      });

      const result = await strategy.createPayment(
        createPaymentData as any,
        paymentAccount
      );

      expect(stripeMock.checkout.sessions.create).toHaveBeenCalled();
      expect(result).toEqual({
        preference_id: 'sess_123',
        url: 'https://stripe-session',
        external_reference: 'intent_123',
      });
    });

    it('should throw InternalServerErrorException on stripe error', async () => {
      stripeMock.checkout.sessions.create.mockRejectedValue(
        new Error('Stripe error')
      );

      await expect(
        strategy.createPayment(createPaymentData as any, paymentAccount)
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('verifyPayment', () => {
    it('should return VerifyPaymentResult when succeeded', async () => {
      stripeMock.paymentIntents.retrieve.mockResolvedValue({
        id: 'pi_123',
        status: 'succeeded',
        amount: 2000,
        currency: 'usd',
        payment_method_types: ['card'],
        application_fee_amount: 100,
        metadata: {
          external_id: 'intent_123',
          reservation_id: 'res_123',
        },
        transfer_data: {
          destination: 'acct_123',
        },
      });

      const result = await strategy.verifyPayment('pi_123');

      expect(result).toEqual({
        external_reference: 'intent_123',
        paymentId: 'pi_123',
        provider: PROVIDERS.STRIPE,
        reservationId: 'res_123',
        status: 'succeeded',
        amount: 20,
        paymentMethod: 'card',
        currency: 'usd',
        feeAmount: 1,
        destinationAccount: 'acct_123',
      });
    });

    it('should return null if not succeeded', async () => {
      stripeMock.paymentIntents.retrieve.mockResolvedValue({
        status: 'processing',
      });

      const result = await strategy.verifyPayment('pi_123');

      expect(result).toBeNull();
    });
  });
});
