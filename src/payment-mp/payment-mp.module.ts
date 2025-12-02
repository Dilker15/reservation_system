import { Module } from '@nestjs/common';
import { PaymentMpService } from './services/payment-mp.service';
import { PaymentMpController } from './payment-mp.controller';
import { ConfigModule } from '@nestjs/config';
import { mpConfigProvider } from './mp.config';
import { PreferencesMp } from './services/preference.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payments.entity';

@Module({
  imports:[ConfigModule,
           TypeOrmModule.forFeature([Payment])
  ],
  controllers: [PaymentMpController],
  providers: [PaymentMpService,mpConfigProvider,PreferencesMp],
})
export class PaymentMpModule {}
