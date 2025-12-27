import { PROVIDERS } from "src/common/Interfaces";


interface ItemData {

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