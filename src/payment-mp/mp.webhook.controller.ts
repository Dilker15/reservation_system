import { Body, Controller, Post, HttpCode, UseGuards } from "@nestjs/common";
import { Public } from "src/auth/decorators/public.decorator";
import { MercadoPagoWebhookGuard } from "src/auth/guards/mercado-pago-webhook-guards";
import { MpEventAdapter } from "./adapters/mp.event.adater";
import { WebHookService } from "./services/webhook.service";

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Webhooks')
@Controller('webhook/MERCADO_PAGO')
export class MercadoPagoWebHookController {

  constructor(private readonly webhookSevice: WebHookService) {}

  @Public()
  @Post()
  @HttpCode(200)
  @UseGuards(MercadoPagoWebhookGuard) //// VALIDATE MERCADO_PAGO SIGNATURE 
  @ApiOperation({ summary: 'Receive Mercado Pago webhook events' })
  @ApiBody({schema: {type: 'object',
      description: 'Raw webhook payload from Mercado Pago',
      example: {
        action: 'payment.updated',
        data: {id: '123456789'},
      },
    },
  })
  @ApiResponse({status: 200,description: 'Webhook received successfully',
  })
  async handleEvent(@Body() body: any) {
    const event = MpEventAdapter.adapt(body);
    try {
      if (event) {
        await this.webhookSevice.processEvent(event);
      }
    } catch (error) {
      console.error('Webhook mp processing error:', error);
    }
    return { status: 'received' };
  }
}