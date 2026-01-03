import { PreferenceResponse } from "mercadopago/dist/clients/preference/commonTypes";
import { CreatePaymentData, CreatePaymentResponse, CreatePreferenceRespone } from "./create.payment";
import { VerifyPaymentResult } from "./create.payment";
import { PaymentAccount } from "src/payment_accounts/entities/payment_account.entity";





export interface IPaymentProvider{

    createPayment(data:CreatePaymentData,vendor:PaymentAccount|null):Promise<CreatePreferenceRespone>;
    verifyPayment(paymentId:string):Promise<VerifyPaymentResult | null>;
    transformPreferenceResponse(preferenceData:any):CreatePreferenceRespone;
    refundPayment(paymentId:string):Promise<void>
}