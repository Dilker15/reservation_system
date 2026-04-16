import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseEnumPipe,
  Res,
  Query,
  ParseUUIDPipe,
  UseInterceptors,
} from '@nestjs/common';
import { PaymentAccountsService } from './payment_accounts.service';
import { GetUser } from 'src/auth/decorators/getUser.decorator';
import { User } from 'src/users/entities/user.entity';
import { PROVIDERS, Roles } from 'src/common/Interfaces';
import { Role } from 'src/auth/decorators/role.decorator';
import { Public } from 'src/auth/decorators/public.decorator';
import type { Response } from 'express';
import { DisconnectPaymentAccountDto } from './dto/disconnect-payment-account.dto';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { IdempotencyInterceptor } from 'src/common/interceptors/idempotency.interceptor';

@ApiTags('Payment Accounts')
@Controller('payment-accounts')
export class PaymentAccountsController {
  constructor(private readonly paymentAccountsService: PaymentAccountsService) {}

  @Role(Roles.OWNER)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Get connected payment accounts' })
  @ApiResponse({ status: 200, description: 'List of connected accounts' })
  getAccounts(@GetUser() owner: User) {
    return this.paymentAccountsService.getConnectedAccounts(owner);
  }

  @UseInterceptors(IdempotencyInterceptor)
  @Role(Roles.OWNER)
  @ApiBearerAuth()
  @Get('oauth/:provider/connect')
  @ApiOperation({ summary: 'Redirect to payment provider OAuth' })
  @ApiParam({ name: 'provider', enum: PROVIDERS })
  @ApiResponse({ status: 200, description: 'OAuth URL generated' })
  redirectToProvider(
    @Param('provider', new ParseEnumPipe(PROVIDERS)) provider: PROVIDERS,
    @GetUser() admin: User,
  ) {
    return this.paymentAccountsService.createUrlAuth(admin, provider);
  }

  @Public()
  @Get('callback/:provider')
  @ApiOperation({ summary: 'OAuth callback from provider' })
  @ApiParam({ name: 'provider', enum: PROVIDERS })
  @ApiQuery({ name: 'code', required: false })
  @ApiQuery({ name: 'state', required: false })
  @ApiQuery({ name: 'error', required: false })
  @ApiResponse({ status: 302, description: 'Redirect to frontend' })
  async callbackOAuth(
    @Param('provider', new ParseEnumPipe(PROVIDERS)) provider: PROVIDERS,
    @Res() res: Response,
    @Query('code') code?: string,
    @Query('state') state?: string,
    @Query('error') error?: string,
  ) {
    if (error) {
      return res.redirect(`${process.env.FRONT_END_URL}/error?reason=${error}`);
    }

    if (!code || !state) {
      return res.redirect(`${process.env.FRONT_END_URL}/error?reason=missing_params`);
    }

    await this.paymentAccountsService.exchangeCodeForToken(state, provider, code);
    return res.redirect(`${process.env.FRONT_END_URL}/dashboard/connectAccounts`);
  }

  @Role(Roles.OWNER)
  @ApiBearerAuth()
  @Post(':id/disconnect')
  @ApiOperation({ summary: 'Disconnect a payment account' })
  @ApiParam({ name: 'id', example: 'uuid' })
  @ApiBody({ type: DisconnectPaymentAccountDto })
  @ApiResponse({ status: 200, description: 'Account disconnected successfully' })
  disconnectAccount(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() owner: User,
    @Body() dto: DisconnectPaymentAccountDto,
  ) {
    return this.paymentAccountsService.disconnect(id, dto, owner);
  }
}