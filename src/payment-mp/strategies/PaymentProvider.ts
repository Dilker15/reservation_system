import { PreferenceResponse } from "mercadopago/dist/clients/preference/commonTypes";
import { CreatePaymentData, CreatePaymentResponse } from "../interfaces/create.payment";
import { VerifyPaymentResult } from "../interfaces/verify.payment";





export interface PaymentProvider{

    createPayment(data:CreatePaymentData):Promise<PreferenceResponse>;
    verifyPayment(payload:any):Promise<VerifyPaymentResult>;

}