import { Body, Controller, Post } from "@nestjs/common";
import { MercadoPagoWeebHookService } from "./services/mp.webhook.service";
import { Public } from "src/auth/decorators/public.decorator";



@Controller('webhook/mercado-pago')
export class MercadoPagoWebHookController{

    constructor(private readonly mercadoService:MercadoPagoWeebHookService){

    }

   
       @Public()
       @Post()
       async handleEvent(@Body() body: any){
           const response = await this.mercadoService.processEvent(body);
           return { status: response };
       }




}