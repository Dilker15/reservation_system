import { Module } from '@nestjs/common';
import { PaymentMpController } from './payment-mp.controller';
import { ConfigModule } from '@nestjs/config';
import { mpConfigProvider } from './mp.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentIntent } from './entities/payments.entity';
import { MercadoPagoStrategy } from './strategies/MercadoPagoStrategy';
import { StripeStrategy } from './strategies/StripeStrategy';
import { PaymentStrategyFactory } from './strategies/PaymentStrategyFactory';
import { PaymentService } from './services/payment.service';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import { StripeWebHookController } from './stripe.webhook.controller';
import { MercadoPagoWebHookController } from './mp.webhook.controller';
import { MercadoPagoWeebHookService } from './services/mp.webhook.service';
import { StripeWebhookService } from './services/stripe.webhook.service';
import { ParserNotificationData } from 'src/common/helpers/parserNotificationData';
import { QueueBullModule } from 'src/queue-bull/queue-bull.module';
import { stripeProvider } from './stripe.config';

@Module({
  imports:[ConfigModule,
           TypeOrmModule.forFeature([PaymentIntent,Reservation]),
           QueueBullModule,
  ],
  controllers: [PaymentMpController,StripeWebHookController,MercadoPagoWebHookController],
  providers: [PaymentService,mpConfigProvider,MercadoPagoStrategy,StripeStrategy,PaymentStrategyFactory,MercadoPagoWeebHookService,
              StripeWebhookService,stripeProvider,
              ParserNotificationData,
  ],
  exports:[stripeProvider],
})
export class PaymentMpModule {}
