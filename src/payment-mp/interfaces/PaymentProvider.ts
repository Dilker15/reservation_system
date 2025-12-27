import { PreferenceResponse } from "mercadopago/dist/clients/preference/commonTypes";
import { CreatePaymentData, CreatePaymentResponse, CreatePreferenceRespone } from "./create.payment";
import { VerifyPaymentResult } from "./verify.payment";





export interface PaymentProvider{

    createPayment(data:CreatePaymentData):Promise<CreatePreferenceRespone>;
    verifyPayment(payload:any):Promise<VerifyPaymentResult | null>;
    transformPreferenceResponse(preferenceData:any):CreatePreferenceRespone
}