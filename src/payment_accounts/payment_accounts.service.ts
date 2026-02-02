import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { PAYMENT_ACCOUNTS_STATUS, PROVIDERS } from 'src/common/Interfaces';
import { User } from 'src/users/entities/user.entity';
import { OAuthFactory } from './strategies/StrategyOAuthFactory';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentAccount } from './entities/payment_account.entity';
import { Repository } from 'typeorm';
import { TokenEncrytionService } from 'src/token-encrytion/token-encrytion.service';
import { StatesService } from './strategies/states.service';
import { BcryptService } from 'src/common/helpers/bcryp';
import { DisconnectPaymentAccountDto } from './dto/disconnect-payment-account.dto';


@Injectable()
export class PaymentAccountsService {

  constructor(private readonly strategyFactory:OAuthFactory,
              @InjectRepository(PaymentAccount) private readonly paymentAccountRepo:Repository<PaymentAccount>,
              private readonly stateService:StatesService,
              private readonly tokenEncryptService:TokenEncrytionService,
              private readonly bcrypService:BcryptService,

){
  }

  async createUrlAuth(currenAdmin: User,provider: PROVIDERS): Promise<string> {
    try{
      const userHasAccountProvider =
      await this.paymentAccountRepo.findOneBy({
        admin: { id: currenAdmin.id },status: PAYMENT_ACCOUNTS_STATUS.ACTIVE,provider,
      });
  
    if (userHasAccountProvider) {
      throw new BadRequestException(`You are connected with this provider ${provider}`);
    }
  
    const state = await this.stateService.create(currenAdmin.id);
    const strategy = this.strategyFactory.getStrategy(provider);
    return strategy.generateAuthUrl(state);
    }catch(error){
      console.log(error);
      return "";
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


  async getConnectedAccounts(owner:User){
    try{
       const accounts = await this.paymentAccountRepo.findBy({
          admin:{id:owner.id},status:PAYMENT_ACCOUNTS_STATUS.ACTIVE
       });
       return accounts.map(acc => ({status: acc.status,provider: acc.provider,id:acc.id}));
    }catch(error){
      console.log(error);
      throw error;
    }
  }


  async disconnect(account_id:string,dtoDisconnec:DisconnectPaymentAccountDto,owner:User){
    try{
      const isValid = await this.validateOwnerCredentials(dtoDisconnec.password, owner.password);
      if (!isValid) {
        throw new UnauthorizedException('Invalid credentials');
      }
       const account = await this.paymentAccountRepo.findOne({
        where: {id: account_id,
          admin: { id: owner.id },
          status: PAYMENT_ACCOUNTS_STATUS.ACTIVE,
        },
      });
       if(!account){
         throw new BadRequestException(`Account not found to remove : ${account_id}`);
       }
       account.status=PAYMENT_ACCOUNTS_STATUS.INACTIVE;
       await this.paymentAccountRepo.save(account);
    }catch(err){
       console.log(err);
       throw err;
    }
  }


  private async validateOwnerCredentials(passwordPlain:string,passwordCrypt:string):Promise<boolean>{
     return this.bcrypService.verifyPassword(passwordPlain,passwordCrypt);
  }




}
