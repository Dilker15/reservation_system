import { Body, Controller, Headers, HttpCode, HttpStatus, Post, Res, UseGuards } from "@nestjs/common";

import { Public } from "src/auth/decorators/public.decorator";
import { MercadoPagoWebhookGuard } from "src/auth/guards/mercado-pago-webhook-guards";
import { MpEventAdapter } from "./adapters/mp.event.adater";
import { WebHookService } from "./services/webhook.service";



@Controller('webhook/MERCADO_PAGO')
export class MercadoPagoWebHookController{

    constructor(private readonly webhookSevice:WebHookService){
                
    }

   
        @Public() 
        @Post()
        @HttpCode(200)
        @UseGuards(MercadoPagoWebhookGuard) // VALIDATE MP SIGNATURE
        async handleEvent(@Body() body: any) {
            const event = MpEventAdapter.adapt(body);
            try {
              if(event){
                await this.webhookSevice.processEvent(event);
              }
            } catch (error) {
              console.error('Webhook mp processing error:', error);
            }   
            return { status: 'received' };
        }




}