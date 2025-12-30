import { Inject, Injectable, InternalServerErrorException, NotImplementedException } from "@nestjs/common";
import { CreatePaymentData, CreatePaymentResponse, CreatePreferenceRespone } from "../interfaces/create.payment";
import { VerifyPaymentResult } from "../interfaces/verify.payment";
import { PaymentProvider } from "../interfaces/PaymentProvider";
import { PreferenceResponse } from "mercadopago/dist/clients/preference/commonTypes";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";
import { STRIPE_CLIENT } from "../stripe.config";
import { PROVIDERS } from "src/common/Interfaces";




export class StripeStrategy implements PaymentProvider{     // TODO 



    constructor(@Inject(STRIPE_CLIENT) private readonly stripe: Stripe,){
        
    }
  
    async createPayment(data: CreatePaymentData): Promise<CreatePreferenceRespone> {
        try{  
            const session = await this.stripe.checkout.sessions.create({
                mode: 'payment',
                line_items: data.items.map(item => ({
                  price_data: {
                    currency: data.currency!,
                    unit_amount: this.arsToUsdCents(item.unit_price),
                    product_data: {
                      name: item.title,
                    },
                  },
                  quantity: item.quantity,
                })),
            
                client_reference_id:data.reservationId,
                metadata: {
                  external_id: data.intent_id,
                  reservation_id:data.reservationId,

                },
                payment_intent_data:{
                  metadata:{
                    external_id:data.intent_id,
                    reservation_id:data.reservationId,
                  }
                },
            
                success_url: data.back_urls.success,
                cancel_url: data.back_urls.failure
              });
            return this.transformPreferenceResponse(session);
        }catch(error){
            console.log(error);
            throw new InternalServerErrorException("Error creating PaymentLink");
        }
    }


    
    async verifyPayment(paymentId:string): Promise<VerifyPaymentResult | null > {
        const payment = await this.stripe.paymentIntents.retrieve(paymentId);
        
        if(!payment || payment.status !== 'succeeded'){
          return null;
        }
        return this.buildPaymentResult(payment);
    }


    transformPreferenceResponse(preferenceData: any): CreatePreferenceRespone {
       return {
        preference_id:preferenceData.id,
        url:preferenceData.url,
        external_reference:preferenceData.metadata.external_id,
       }
    }



    arsToUsdCents(amountArs: number): number {
        const EXCHANGE_RATE = 1500;     // IT HAS TO BE CHANGED BY WEB MASTER or USE A DIFFERNTE WAY TO CONVERT MONEY NO HARDCODE
        return Math.round((amountArs / EXCHANGE_RATE) * 100);
    }


    private buildPaymentResult(payment:Stripe.PaymentIntent):VerifyPaymentResult{
      const metadata = payment.metadata;
      return {
           external_reference:metadata.external_id,
           paymentId:payment.id,
           provider:PROVIDERS.STRIPE,
           reservationId:metadata.reservation_id,
           status:payment.status,
           amount:(payment.amount/100),
           paymentMethod:payment.payment_method_types[0],
           currency:payment.currency,
        }
    }


}