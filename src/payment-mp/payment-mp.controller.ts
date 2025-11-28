import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PaymentMpService } from './services/payment-mp.service';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('payment-mp')
export class PaymentMpController {

  constructor(private readonly paymentMpService: PaymentMpService) {

  }


  @Public()
  @Post('checkout')
  async createPaymente(){
    const dat = await this.paymentMpService.payTest();
    return dat;
  }

}
