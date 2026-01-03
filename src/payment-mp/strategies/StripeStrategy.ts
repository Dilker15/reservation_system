import { Inject, Injectable, InternalServerErrorException, NotImplementedException } from "@nestjs/common";
import { CreatePaymentData, CreatePaymentResponse, CreatePreferenceRespone, ItemData } from "../interfaces/create.payment";
import { VerifyPaymentResult } from "../interfaces/create.payment";
import { IPaymentProvider } from "../interfaces/PaymentProvider";
import Stripe from "stripe";
import { STRIPE_CLIENT } from "../stripe.config";
import { PROVIDERS } from "src/common/Interfaces";
import { PaymentAccount } from "src/payment_accounts/entities/payment_account.entity";




export class StripeStrategy implements IPaymentProvider{    

    private readonly  EXCHANGE_RATE = 1500; 
    private readonly PLATFORM_FEE_PERCENTAGE_STRIPE = 0.05;  // 5% PLATFORM USE. // WEB MASTER WILL CHANGE IN DASHBOARD


    constructor(@Inject(STRIPE_CLIENT) private readonly stripe: Stripe,){
        
    }
 
  
    async createPayment(data: CreatePaymentData,account: PaymentAccount): Promise<CreatePreferenceRespone> {
    
    
      try {
        const total = this.calculateTotal(data.items);
        const platformFee = Math.round(total * this.PLATFORM_FEE_PERCENTAGE_STRIPE);
    
        const session = await this.stripe.checkout.sessions.create({
          mode: 'payment',
    
          line_items: data.items.map(item => ({
            price_data: {
              currency: data.currency!,
              unit_amount: this.arsToUsdCents(item.unit_price),
              product_data: {
                name: item.title,
              },
            },
            quantity: item.quantity,
          })),
    
          client_reference_id: data.reservationId,
    
          metadata: {
            external_id: data.intent_id,
            reservation_id: data.reservationId,
          },
    
          payment_intent_data: {
            metadata: {
              external_id: data.intent_id,
              reservation_id: data.reservationId,
            },
            transfer_data: {
              destination: account.provider_account_id,
            },
    
            application_fee_amount: platformFee,
          },
    
          success_url: data.back_urls.success,
          cancel_url: data.back_urls.failure,
        });
    
        return this.transformPreferenceResponse(session);
    
      } catch (error) {
        console.error(error);
        throw new InternalServerErrorException(
          'Error creating Stripe Checkout Session'
        );
      }
    }
    


    
    async verifyPayment(paymentId:string): Promise<VerifyPaymentResult | null > {
        const payment = await this.stripe.paymentIntents.retrieve(paymentId);
        
        if(!payment || payment.status !== 'succeeded'){
          return null;
        }
        console.log("PAYMENT DATA STRIPE ::: ",payment);
        return this.buildPaymentResult(payment);
    }


    refundPayment(paymentId: string): Promise<void> {
      throw new Error("Method not implemented.");
    }


    transformPreferenceResponse(preferenceData: any): CreatePreferenceRespone {
       return {
        preference_id:preferenceData.id,
        url:preferenceData.url,
        external_reference:preferenceData.metadata.external_id,
       }
    }

    


    private arsToUsdCents(amountArs: number): number {
           // IT HAS TO BE CHANGED BY WEB MASTER IN A DASHBOARD or USE A DIFFERNTE WAY TO CONVERT MONEY, NO HARDCODE
        return Math.round((amountArs / this.EXCHANGE_RATE) * 100);
    }


    private buildPaymentResult(payment:Stripe.PaymentIntent):VerifyPaymentResult{
      const metadata = payment.metadata;
      const feeCalculated  = payment.application_fee_amount!/100; 
      const destination =  typeof payment.transfer_data?.destination === 'string'
                          ? payment.transfer_data.destination
                          : payment.transfer_data?.destination?.id;

      const destinationAccount = destination ?? '';
      return {
           external_reference:metadata.external_id,
           paymentId:payment.id,
           provider:PROVIDERS.STRIPE,
           reservationId:metadata.reservation_id,
           status:payment.status,
           amount:(payment.amount/100),
           paymentMethod:payment.payment_method_types[0],
           currency:payment.currency,
           feeAmount:feeCalculated,
           destinationAccount:destinationAccount
        }
    }

    private calculateTotal(items: ItemData[]): number {
      return items.reduce((acc, item) => {
        const price = this.arsToUsdCents(item.unit_price);
        return acc + price * item.quantity;
      }, 0);
    }
    

}