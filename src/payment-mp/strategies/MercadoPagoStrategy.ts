import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotImplementedException } from "@nestjs/common";
import { CreatePaymentData, CreatePaymentResponse } from "../interfaces/create.payment";
import { VerifyPaymentResult } from "../interfaces/verify.payment";
import { PaymentProvider } from "../interfaces/PaymentProvider";
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { MP_CONFIG } from "../mp.config";
import { PreferenceResponse } from "mercadopago/dist/clients/preference/commonTypes";
import { PAYMENTS_STATUS, PROVIDERS } from "src/common/Interfaces";
import { PaymentResponse } from "mercadopago/dist/clients/payment/commonTypes";





export class MercadoPagoStrategy implements PaymentProvider{


    private readonly preferences:Preference
    private readonly payment:Payment;

    constructor(@Inject(MP_CONFIG) private readonly config: MercadoPagoConfig){
            this.preferences = new Preference(config);
            this.payment = new Payment(config);
    }
    

    async createPayment(data: CreatePaymentData): Promise<PreferenceResponse> {
     try{
        
        const responseMp = await this.preferences.create({
            body: {
                items:data.items,
                auto_return: data.auto_return,
                notification_url: data.notification_url,
                metadata:{
                    reservation:data.reservationId
                },
                back_urls:data.back_urls,
                external_reference:data.intent_id,
            },

        });
    
    return responseMp;
     }catch(error){
        console.log(error);
        throw new InternalServerErrorException("Unexpected error MP payment");
     }
        
    }



    async verifyPayment(payload: any): Promise<VerifyPaymentResult | null> {
        const currentPayment: PaymentResponse = await this.payment.get({ id: payload.id });

        if (currentPayment.status !== 'approved') {
            return null;
        }

        return this.buildPaymentResult(currentPayment);
    }

    

    private buildPaymentResult(data:PaymentResponse):VerifyPaymentResult{
        return {
            paymentId:data.id?.toString()!,
            provider:PROVIDERS.MP,
            status:data.status!,
            payerEmail:data.payer?.email,
            payerName:data.payer?.first_name,
            amount:data.transaction_amount,
            reservationId:data.metadata,
            paymentMethod:data.payment_method_id,
            external_reference:data.external_reference!,
        }
    }

}