import { Controller, Get, Post, Body, Patch, Param, Delete, ParseEnumPipe, Res, Redirect, Query, BadRequestException } from '@nestjs/common';
import { PaymentAccountsService } from './payment_accounts.service';
import { CreatePaymentAccountDto } from './dto/create-payment_account.dto';
import { GetUser } from 'src/auth/decorators/getUser.decorator';
import { User } from 'src/users/entities/user.entity';
import { PROVIDERS, Roles } from 'src/common/Interfaces';
import { Role } from 'src/auth/decorators/role.decorator';
import { Public } from 'src/auth/decorators/public.decorator';


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
    

    @Public()
    @Get('callback/:provider')
    async callbackOAuth(@Param('provider') provider: string,@Query('code') code?: string,@Query('state') state?: string,
                        @Query('error') error?: string
    ) {
      if (error) {
        throw new BadRequestException(`${provider} authorization failed`);
      }

      if (!code || !state) {
        throw new BadRequestException('Missing code or state');
      }

      const providerEnum = provider.toUpperCase();
      if (!Object.values(PROVIDERS).includes(providerEnum as any)) {
        throw new BadRequestException('Unsupported provider');
      }
      await this.paymentAccountsService.exchangeCodeForToken(state, providerEnum as PROVIDERS, code);

      return {
        success: true,
        message: `${providerEnum} account connected successfully`,
      };
    }


 
  
}
