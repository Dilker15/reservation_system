import { Controller, Post, Req, UseGuards } from "@nestjs/common";
import { Public } from "src/auth/decorators/public.decorator";
import { StripeWebhookGuard } from "src/auth/guards/stripe-webhook-guard";
import Stripe from "stripe";
import { StripeEventAdapter } from "./adapters/stripe.event.adapter";
import { WebHookService } from "./services/webhook.service";

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Webhooks')
@Controller('webhook/STRIPE')
export class StripeWebHookController {

  constructor(private readonly webhookService: WebHookService) {}

  @Public()
  @UseGuards(StripeWebhookGuard)
  @Post()
  @ApiOperation({ summary: 'Receive Stripe webhook events' })
  @ApiBody({
    schema: {
      type: 'object',
      description: 'Raw webhook payload from Stripe',
      example: {
        id: 'evt_123456789',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_123456789',
            amount: 1000,
            currency: 'usd',
          },
        },
      },
    },
  })
  @ApiResponse({status: 201,description: 'Webhook received successfully'})
  async handleEvent(@Req() req: Request & { stripeEvent: Stripe.Event }) {
    const event = StripeEventAdapter.adapt(req.stripeEvent);
    if (event) {
      await this.webhookService.processEvent(event);
    }
    return { received: true };
  }
}