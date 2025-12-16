import { Body, Controller, Headers, HttpCode, HttpStatus, Post, Res, UseGuards } from "@nestjs/common";
import { MercadoPagoWeebHookService } from "./services/mp.webhook.service";
import { Public } from "src/auth/decorators/public.decorator";
import { MercadoPagoWebhookGuard } from "src/auth/guards/mercado-pago-webhook-guards";



@Controller('webhook/mercado-pago')
export class MercadoPagoWebHookController{

    constructor(private readonly mercadoService:MercadoPagoWeebHookService){

    }

   
        @Public()
        @Post()
        @HttpCode(200)
        @UseGuards(MercadoPagoWebhookGuard)
        async handleEvent(@Body() body: any) {
            try {
            await this.mercadoService.processEvent(body);
            } catch (error) {
            console.error('Webhook processing error:', error);
            }   
            return { status: 'received' };
        }




}