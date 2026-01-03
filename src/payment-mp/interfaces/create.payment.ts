import { PROVIDERS } from "src/common/Interfaces";


export interface ItemData {

    id:string,
    unit_price:number,
    quantity:number,
    title:string,
    description:string,
    name:string,

}

interface BackUrls {
  success:string,
  failure:string,
  pending:string,
}

export interface CreatePaymentData{
    items:ItemData[],
    reservationId: string;       
    amount: number;            
    currency?: string;           
    description?: string;        
    buyerEmail?: string;        
    buyerName?: string;         
    provider: PROVIDERS,
    auto_return: "approved",
    metadata:any,
    notification_url?: string,
    back_urls:BackUrls,
    intent_id:string,
} 



  export interface CreatePaymentResponse{   
    payment_link: string;
    provider: string;       
    reservation:string,    
}


export interface WebhookEventParse {
  id: string;
  type: string;
  provider: PROVIDERS;
  data: any;
  timestamp: Date;
}


export interface CreatePreferenceRespone {
  external_reference?:string;
  url:string,
  preference_id:string;
}


export interface PaymentEvent {
  provider: PROVIDERS,
  eventType: 'payment_succeeded' | 'payment_failed' | 'refund';
  providerEventId: string;
  paymentId: string;
  payload: any;
}


export interface VerifyPaymentResult {

  provider: PROVIDERS,
  paymentId: string;
  reservationId: string;
  status: string
  amount?: number;
  payerEmail?: string;
  payerName?: string;
  paymentMethod?: string,
  external_reference:string,
  payerId?:string,
  currency:string,
  feeAmount:number,
  destinationAccount?:string,
  
}
