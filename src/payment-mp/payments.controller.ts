import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, ParseEnumPipe } from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { PROVIDERS } from 'src/common/Interfaces';
import { PaymentService } from './services/payment.service';

@Controller('payment-mp')
export class PaymentMpController {

  constructor(private readonly paymentServices:PaymentService) {

  }

 
  @Public()
  @Get('checkout/:reservation/:provider')
  async createPayment(@Param('reservation',ParseUUIDPipe) reservation:string,@Param('provider',new ParseEnumPipe(PROVIDERS)) provider:PROVIDERS){
    return this.paymentServices.createPayment(reservation,provider);
  }

}
