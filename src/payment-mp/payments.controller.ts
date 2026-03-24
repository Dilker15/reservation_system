import { Controller, Get, Param, ParseUUIDPipe, ParseEnumPipe } from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { PROVIDERS } from 'src/common/Interfaces';
import { PaymentService } from './services/payment.service';
import {ApiTags,ApiOperation,ApiResponse,ApiParam} from '@nestjs/swagger';

@ApiTags('Payments')
@Controller('payment-mp')
export class PaymentMpController {

  constructor(private readonly paymentServices: PaymentService) {}

  @Public()
  @Get('checkout/:reservation/:provider')
  @ApiOperation({ summary: 'Create payment checkout for a reservation' })
  @ApiParam({ name: 'reservation', example: 'uuid' })
  @ApiParam({ name: 'provider', enum: PROVIDERS })
  @ApiResponse({ status: 200, description: 'Payment checkout created' })
  async createPayment(@Param('reservation', ParseUUIDPipe) reservation: string,
                      @Param('provider', new ParseEnumPipe(PROVIDERS)) provider: PROVIDERS,
  ) {
    return await this.paymentServices.createPayment(reservation, provider);
  }
}