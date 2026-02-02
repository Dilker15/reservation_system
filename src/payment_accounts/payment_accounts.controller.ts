import { Controller, Get, Post, Body, Patch, Param, Delete, ParseEnumPipe, Res, Redirect, Query, BadRequestException, ParseUUIDPipe } from '@nestjs/common';
import { PaymentAccountsService } from './payment_accounts.service';
import { CreatePaymentAccountDto } from './dto/create-payment_account.dto';
import { GetUser } from 'src/auth/decorators/getUser.decorator';
import { User } from 'src/users/entities/user.entity';
import { PROVIDERS, Roles } from 'src/common/Interfaces';
import { Role } from 'src/auth/decorators/role.decorator';
import { Public } from 'src/auth/decorators/public.decorator';
import type { Response } from 'express';
import { DisconnectPaymentAccountDto } from './dto/disconnect-payment-account.dto';

@Controller('payment-accounts')
export class PaymentAccountsController {

  constructor(private readonly paymentAccountsService: PaymentAccountsService) {}

 
  @Role(Roles.OWNER)
  @Get()
  getAccounts(@GetUser() owner: User) {
    return this.paymentAccountsService.getConnectedAccounts(owner);
  }

 
  @Role(Roles.OWNER)
  @Get('oauth/:provider/connect')
  redirectToProvider(@Param('provider', new ParseEnumPipe(PROVIDERS)) provider: PROVIDERS,@GetUser() admin: User) {
    return this.paymentAccountsService.createUrlAuth(admin, provider);
  }

 
  @Public()
  @Get('callback/:provider')
  async callbackOAuth(
    @Param('provider', new ParseEnumPipe(PROVIDERS)) provider: PROVIDERS,
    @Res() res: Response,
    @Query('code') code?: string,
    @Query('state') state?: string,
    @Query('error') error?: string
  ) {

    if (error) {
      return res.redirect(`${process.env.FRONT_END_URL}/error?reason=${error}`);
    }

    if (!code || !state) {
      return res.redirect(`${process.env.FRONT_END_URL}/error?reason=missing_params`);
    }

    // Intercambiar código por token
    await this.paymentAccountsService.exchangeCodeForToken(state, provider, code);
    return res.redirect(`${process.env.FRONT_END_URL}/dashboard/connectAccounts`);
  }


  @Role(Roles.OWNER)
  @Post(':id/disconnect')
  disconnectAccount(@Param('id', ParseUUIDPipe) id: string,@GetUser() owner: User,@Body() dto: DisconnectPaymentAccountDto) {
    return this.paymentAccountsService.disconnect(id, dto, owner);
  }
  

}