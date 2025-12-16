import { Injectable } from "@nestjs/common";
import { IWebhook } from "../interfaces/WebHookStrategy";
import { WebhookEventParse } from "../interfaces/create.payment";
import { PaymentStrategyFactory } from "../strategies/PaymentStrategyFactory";
import { PROVIDERS } from "src/common/Interfaces";
import { InjectRepository } from "@nestjs/typeorm";
import { PaymentIntent } from "../entities/payments.entity";
import { Repository } from "typeorm";



@Injectable()
export class MercadoPagoWeebHookService implements IWebhook{

    constructor(private readonly paymentStrategyFactory:PaymentStrategyFactory,
                @InjectRepository(PaymentIntent) private readonly:Repository<PaymentIntent>){
                
    }

    validateSignature(rawBody: string, signature: string): boolean {
        throw new Error("Method not implemented.");
    }



    parseEvent(payload: any): WebhookEventParse {
        throw new Error("Method not implemented.");
    }


    
    async processEvent(event: WebhookEventParse): Promise<void> {
        try{
             const result =  this.paymentStrategyFactory.getStretegy(PROVIDERS.MP);
             const paymentCurrent = await result.verifyPayment(event.data);
             if(!paymentCurrent){
                console.log('Payment not approved yet');
                return;
             }
            // const payment = await this.

            console.log('PAYMENT APPROVED:', paymentCurrent);
        }catch(error){
            console.log(error);
          
        }
       
    }



}
