import { Controller, Get, Post, Body, Patch, Param, Delete, ParseEnumPipe, Res, Redirect } from '@nestjs/common';
import { PaymentAccountsService } from './payment_accounts.service';
import { CreatePaymentAccountDto } from './dto/create-payment_account.dto';
import { GetUser } from 'src/auth/decorators/getUser.decorator';
import { User } from 'src/users/entities/user.entity';
import { PROVIDERS, Roles } from 'src/common/Interfaces';
import { Role } from 'src/auth/decorators/role.decorator';


@Controller('payment-accounts')
export class PaymentAccountsController {


  constructor(private readonly paymentAccountsService: PaymentAccountsService) {}


   
  


    @Role(Roles.OWNER)
    @Get('/oauth/:provider/connect')
    redirectToProvider(
      @Param('provider', new ParseEnumPipe(PROVIDERS)) provider: PROVIDERS,
      @GetUser() admin: User,
    ) {
      return this.paymentAccountsService.createUrlAuth(admin,provider);
    }
    


    @Post('callback/mercado-pago')
    callbackMP(){
       // THIS IS SIMULATED IN ROUTE / oauth/provider/connect.
    }



    @Post('callback/stripe')
    callbackStripe(){

    }




 
  
}
