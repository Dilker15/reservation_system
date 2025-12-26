import { Injectable } from '@nestjs/common';
import { PROVIDERS } from 'src/common/Interfaces';
import { User } from 'src/users/entities/user.entity';
import { OAuthFactory } from './strategies/StrategyOAuthFactory';
import { OAuthStrategy } from './strategies/0AuthStrategy';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentAccount } from './entities/payment_account.entity';
import { Repository } from 'typeorm';
import { getAuthData } from './data/accounts_data';
import { TokenEncrytionService } from 'src/token-encrytion/token-encrytion.service';

@Injectable()
export class PaymentAccountsService {

  constructor(private readonly strategy:OAuthFactory,
              @InjectRepository(PaymentAccount) private readonly paymentAccountRepo:Repository<PaymentAccount>,
              private readonly encryptionService:TokenEncrytionService,

){

  }

  createUrlAuth(admin:User,provider:PROVIDERS) { // CREATE SHOULD BE IN CALLBACK BUT (MP SANBOX OAUTH NO SUPPORTED)
                                                 // THIS IS AN OUATH MOCK
    const strategy:OAuthStrategy = this.strategy.getStrategy(provider)
    const url = strategy.generateAuthUrl(admin.id);
    const index = Math.floor(Math.random() * 6);
    const userAccount = getAuthData(index);
    this.paymentAccountRepo.save({
      access_token:this.encryptionService.encrypt(userAccount.access_token),
      admin,
      provider:PROVIDERS.MP,
      refresh_token:this.encryptionService.encrypt(userAccount.refresh_token),
      token_type:userAccount.token_type,
      token_expires_at:userAccount.expires_in,
      default_currency:userAccount.default_currency,
      provider_account_id:userAccount.provider_account_id,
    });
    
    return url;
  }
}
