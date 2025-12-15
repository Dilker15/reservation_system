import { PreferenceResponse } from "mercadopago/dist/clients/preference/commonTypes";
import { CreatePaymentData, CreatePaymentResponse } from "./create.payment";
import { VerifyPaymentResult } from "./verify.payment";





export interface PaymentProvider{

    createPayment(data:CreatePaymentData):Promise<PreferenceResponse>;
    verifyPayment(payload:any):Promise<VerifyPaymentResult | null>;

}