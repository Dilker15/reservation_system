import { Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { CreatePaymentData, CreatePaymentResponse } from "../interfaces/create.payment";
import { VerifyPaymentResult } from "../interfaces/verify.payment";
import { PaymentProvider } from "./PaymentProvider";
import MercadoPagoConfig, { Preference } from "mercadopago";
import { MP_CONFIG } from "../mp.config";
import { PreferenceResponse } from "mercadopago/dist/clients/preference/commonTypes";




export class MercadoPagoStrategy implements PaymentProvider{


    private readonly preferences:Preference
    
    constructor(@Inject(MP_CONFIG) private readonly config: MercadoPagoConfig){
            this.preferences = new Preference(config);
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
                external_reference:String(data.reservationId),
            },

        });
    
    return responseMp;
     }catch(error){
        console.log(error);
        throw new InternalServerErrorException("Unexpected error MP payment");
     }
        
    }



    verifyPayment(payload: any): Promise<VerifyPaymentResult> {
        throw new Error("Method not implemented.");
    }


}