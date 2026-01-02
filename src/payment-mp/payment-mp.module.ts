import { Module } from '@nestjs/common';
import { PaymentMpController } from './payments.controller';
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
import { ParserNotificationData } from 'src/common/helpers/parserNotificationData';
import { QueueBullModule } from 'src/queue-bull/queue-bull.module';
import { stripeProvider } from './stripe.config';
import { AppLoggerModule } from 'src/logger/logger.module';
import { WebHookService } from './services/webhook.service';
import { ReservationModule } from 'src/reservation/reservation.module';

@Module({
  imports:[ConfigModule,
           TypeOrmModule.forFeature([PaymentIntent,Reservation]),
           QueueBullModule,
           AppLoggerModule,
           ReservationModule,
  ],
  controllers: [PaymentMpController,StripeWebHookController,MercadoPagoWebHookController],
  providers: [PaymentService,mpConfigProvider,MercadoPagoStrategy,StripeStrategy,PaymentStrategyFactory,stripeProvider,
              ParserNotificationData,
              WebHookService,
              
  ],
  exports:[stripeProvider],
})
export class PaymentMpModule {}
