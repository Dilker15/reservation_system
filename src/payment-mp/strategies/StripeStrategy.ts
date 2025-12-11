import { Injectable, NotImplementedException } from "@nestjs/common";
import { CreatePaymentData, CreatePaymentResponse } from "../interfaces/create.payment";
import { VerifyPaymentResult } from "../interfaces/verify.payment";
import { PaymentProvider } from "../interfaces/PaymentProvider";
import { PreferenceResponse } from "mercadopago/dist/clients/preference/commonTypes";





export class StripeStrategy implements PaymentProvider{     // TODO : 


    async createPayment(data: CreatePaymentData): Promise<PreferenceResponse> {
        throw new NotImplementedException("Method not implemented");
    }
    verifyPayment(payload: any): Promise<VerifyPaymentResult> {
        throw new NotImplementedException("Method not implemented");
    }



}