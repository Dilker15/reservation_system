import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

export const STRIPE_CLIENT = 'STRIPE_CLIENT';

export const stripeProvider = {
  provide: STRIPE_CLIENT,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    return new Stripe(
      configService.getOrThrow('STRIPE_SECRET_KEY'),
      {
        apiVersion: '2025-12-15.clover',
      },
    );
  },
};
