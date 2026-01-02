import { PreferenceResponse } from "mercadopago/dist/clients/preference/commonTypes";
import { CreatePaymentData, CreatePaymentResponse, CreatePreferenceRespone } from "./create.payment";
import { VerifyPaymentResult } from "./create.payment";





export interface IPaymentProvider{

    createPayment(data:CreatePaymentData):Promise<CreatePreferenceRespone>;
    verifyPayment(paymentId:string):Promise<VerifyPaymentResult | null>;
    transformPreferenceResponse(preferenceData:any):CreatePreferenceRespone;
    refundPayment(paymentId:string):Promise<void>
}