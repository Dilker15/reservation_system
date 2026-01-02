import {Controller, Post, Req, UseGuards } from "@nestjs/common";
import { Public } from "src/auth/decorators/public.decorator";
import { StripeWebhookGuard } from "src/auth/guards/stripe-webhook-guard";
import Stripe from "stripe";
import { InjectRepository } from "@nestjs/typeorm";
import { PaymentIntent } from "./entities/payments.entity";
import { Repository } from "typeorm";
import { StripeEventAdapter } from "./adapters/stripe.event.adapter";
import { WebHookService } from "./services/webhook.service";




@Controller('webhook/STRIPE')
export class StripeWebHookController{

    constructor(private readonly webhookService:WebHookService){

    }


    @Public()
    @UseGuards(StripeWebhookGuard) // VALIDATE STRIPE SIGNATURE 
    @Post()
    async handleEvent(@Req() req: Request & { stripeEvent: Stripe.Event }) {
      const event = StripeEventAdapter.adapt(req.stripeEvent);
      if(event){
        await this.webhookService.processEvent(event);
      }
      return {received:true};
    }




}