import { Module } from '@nestjs/common';
import { PaymentMpController } from './payment-mp.controller';
import { ConfigModule } from '@nestjs/config';
import { mpConfigProvider } from './mp.config';
import { PreferencesMp } from './services/preference.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentIntent } from './entities/payments.entity';
import { MercadoPagoStrategy } from './strategies/MercadoPagoStrategy';
import { StripeStrategy } from './strategies/StripeStrategy';
import { PaymentStrategyFactory } from './strategies/PaymentStrategyFactory';
import { PaymentService } from './services/payment.service';
import { Reservation } from 'src/reservation/entities/reservation.entity';

@Module({
  imports:[ConfigModule,
           TypeOrmModule.forFeature([PaymentIntent,Reservation])
  ],
  controllers: [PaymentMpController],
  providers: [PaymentService,mpConfigProvider,PreferencesMp,MercadoPagoStrategy,StripeStrategy,PaymentStrategyFactory],
})
export class PaymentMpModule {}
