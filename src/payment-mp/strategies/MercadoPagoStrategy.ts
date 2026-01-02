import {  Inject, InternalServerErrorException, NotImplementedException } from "@nestjs/common";
import { CreatePaymentData, CreatePreferenceRespone } from "../interfaces/create.payment";
import { VerifyPaymentResult } from "../interfaces/create.payment";
import { IPaymentProvider } from "../interfaces/PaymentProvider";
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { MP_CONFIG } from "../mp.config";
import {PROVIDERS } from "src/common/Interfaces";
import { PaymentResponse } from "mercadopago/dist/clients/payment/commonTypes";





export class MercadoPagoStrategy implements IPaymentProvider{


    private readonly preferences:Preference
    private readonly payment:Payment;

    constructor(@Inject(MP_CONFIG) private readonly config: MercadoPagoConfig){
            this.preferences = new Preference(config);
            this.payment = new Payment(config);
    }
    

    async createPayment(data: CreatePaymentData): Promise<CreatePreferenceRespone> {
     try{
        const totalAmount = data.items.reduce(
            (total, item) => total + item.unit_price * item.quantity,
            0
          );
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
               // marketplace_fee:totalAmount * 0.1   // IT HAVE TO BE CHANGED IN THE FUTURE FOR WEB MASTER IN A DASHBOARD.
            },

        });
     return this.transformPreferenceResponse(responseMp);
     }catch(error){
        console.log(error);
        throw new InternalServerErrorException("Unexpected error MP payment");
     }
        
    }



    async verifyPayment(paymentId:string): Promise<VerifyPaymentResult | null> {
        const currentPayment: PaymentResponse = await this.payment.get({ id: paymentId });
        if (!currentPayment || currentPayment.status !== 'approved') {
            return null;
        }
        return this.buildPaymentResult(currentPayment);
    }


    refundPayment(paymentId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    

    private buildPaymentResult(data:PaymentResponse):VerifyPaymentResult{
        return {
            paymentId:data.id?.toString()!,
            provider:PROVIDERS.MP,
            status:data.status!,
            payerEmail:data.payer?.email,
            payerName:data.payer?.first_name,
            amount:data.transaction_amount,
            reservationId:data.metadata.reservation_id,
            paymentMethod:data.payment_type_id,
            external_reference:data.external_reference!,
            payerId:data.payer?.id,
            currency:data.currency_id!,
        }
    }



    transformPreferenceResponse(preferenceData: any): CreatePreferenceRespone {
        return {
            external_reference:preferenceData.external_reference!,
            url:preferenceData.init_point!,
            preference_id:preferenceData.id!,
         }
    }

}