import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PROVIDERS } from 'src/common/Interfaces';
import { User } from 'src/users/entities/user.entity';
import { OAuthFactory } from './strategies/StrategyOAuthFactory';
import { OAuthStrategy } from './strategies/0AuthStrategy';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentAccount } from './entities/payment_account.entity';
import { Repository } from 'typeorm';
import { TokenEncrytionService } from 'src/token-encrytion/token-encrytion.service';
import { StatesService } from './strategies/states.service';

@Injectable()
export class PaymentAccountsService {

  constructor(private readonly strategyFactory:OAuthFactory,
              @InjectRepository(PaymentAccount) private readonly paymentAccountRepo:Repository<PaymentAccount>,
              private readonly stateService:StatesService,
              private readonly tokenEncryptService:TokenEncrytionService,

){
  }

  async createUrlAuth(admin:User,provider:PROVIDERS):Promise<string> {
    try{
         const state = await this.stateService.create(admin.id);
          const strategy:OAuthStrategy = this.strategyFactory.getStrategy(provider)
          return strategy.generateAuthUrl(state);
    }catch(error){
         console.log(error);
         throw new InternalServerErrorException(error);
    }
  
  }


  async exchangeCodeForToken(state:string,provider:PROVIDERS,code:string){
    const strategy = this.strategyFactory.getStrategy(provider);
    try{

        const userId = await this.stateService.validate(state);
        const data = await strategy.exchangeCodeForToken(code);
        await this.paymentAccountRepo.save({
          access_token:this.tokenEncryptService.encrypt(data.access_token),
          admin:{id:userId},
          provider:provider,
          provider_account_id:data.providerAccountId,
          refresh_token:this.tokenEncryptService.encrypt(data.refresh_token!),
          token_type:data.type_token
        });
    }catch(error){
       console.log(error);
       throw new InternalServerErrorException("Unexpected error");
    }
  }

}
