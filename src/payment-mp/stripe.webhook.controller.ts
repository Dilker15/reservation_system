import { BadRequestException, Body, Controller, HttpCode, Post, Req, UseGuards } from "@nestjs/common";
import { StripeWebhookService } from "./services/stripe.webhook.service";
import { Public } from "src/auth/decorators/public.decorator";
import { StripeWebhookGuard } from "src/auth/guards/stripe-webhook-guard";
import Stripe from "stripe";
import { InjectRepository } from "@nestjs/typeorm";
import { PaymentIntent } from "./entities/payments.entity";
import { Repository } from "typeorm";




@Controller('webhook/STRIPE')
export class StripeWebHookController{

    constructor(private readonly stripeService:StripeWebhookService){

    }


    @Public()
    @UseGuards(StripeWebhookGuard) // VALIDATE STRIPE SIGNATURE 
    @Post()
    async handleEvent(@Req() req: Request & { stripeEvent: Stripe.Event }) {
      const event = req.stripeEvent;
      await this.stripeService.processEvent(event as Stripe.Event);
      return {received:true};
    }




}