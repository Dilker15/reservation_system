import { Module } from '@nestjs/common';
import { PaymentAccountsService } from './payment_accounts.service';
import { PaymentAccountsController } from './payment_accounts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentAccount } from './entities/payment_account.entity';
import { OAuthFactory } from './strategies/StrategyOAuthFactory';
import { MercadoPagoStrategy } from 'src/payment-mp/strategies/MercadoPagoStrategy';
import { StripeOAuthStrategy } from './strategies/Stripe0AuthStrategy';
import { MercadoPagoOAuthStrategy } from './strategies/Mp0AuthStrategy';
import { ConfigModule } from '@nestjs/config';
import { TokenEncrytionModule } from 'src/token-encrytion/token-encrytion.module';
import { OAuthStates } from './entities/oauth_states.entity';
import { StatesService } from './strategies/states.service';
import { BcryptService } from 'src/common/helpers/bcryp';
import { IdempotencyInterceptor } from 'src/common/interceptors/idempotency.interceptor';
import { CacheRedisModule } from 'src/cache-redis/cache-redis.module';

@Module({
  imports:[
    TypeOrmModule.forFeature([PaymentAccount,OAuthStates]),
    ConfigModule,
    TokenEncrytionModule,
    CacheRedisModule,
  ],
  controllers: [PaymentAccountsController],
  providers: [PaymentAccountsService,OAuthFactory,MercadoPagoOAuthStrategy,StripeOAuthStrategy,StatesService,BcryptService,IdempotencyInterceptor],
})
export class PaymentAccountsModule {}
