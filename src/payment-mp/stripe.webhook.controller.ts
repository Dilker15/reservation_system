import { BadRequestException, Body, Controller, HttpCode, Post, UseGuards } from "@nestjs/common";
import { StripeWebhookService } from "./services/stripe.webhook.service";
import { Public } from "src/auth/decorators/public.decorator";
import { StripeWebhookGuard } from "src/auth/guards/stripe-webhook-guard";




@Controller('webhook/STRIPE')
export class StripeWebHookController{

    constructor(private readonly stripeService:StripeWebhookService){

    }


    @Public()
    @UseGuards(StripeWebhookGuard) // VALIDATE STRIPE SIGNATURE 
    @Post()
    handleEvent(@Body() body: any) {
      if (body.type === 'checkout.session.completed') {

      }
      
      return {received:true};
    }




}