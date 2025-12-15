import { Body, Controller, Post } from "@nestjs/common";
import { StripeWebhookService } from "./services/stripe.webhook.service";
import { Public } from "src/auth/decorators/public.decorator";




@Controller('webhook/stripe')
export class StripeWebHookController{


    constructor(private readonly stripeService:StripeWebhookService){

    }


    @Public()
    @Post()
    handleEvent(@Body() body: any) {
        console.log("🔔 Pago confirmado por Mercado Pago:");
        console.log(body);
        return { status: 'ok' };
    }





}