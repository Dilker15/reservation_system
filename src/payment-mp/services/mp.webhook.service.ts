import { BadRequestException, Injectable } from "@nestjs/common";
import { IWebhook } from "../interfaces/WebHookStrategy";
import { WebhookEventParse } from "../interfaces/create.payment";
import { PaymentStrategyFactory } from "../strategies/PaymentStrategyFactory";
import { PAYMENTS_STATUS, PROVIDERS } from "src/common/Interfaces";
import { InjectRepository } from "@nestjs/typeorm";
import { PaymentIntent } from "../entities/payments.entity";
import { Repository } from "typeorm";



@Injectable()
export class MercadoPagoWeebHookService implements IWebhook{

    constructor(private readonly paymentStrategyFactory:PaymentStrategyFactory,
                @InjectRepository(PaymentIntent) private readonly paymentIntenRepo:Repository<PaymentIntent>){
                
    }

 


    
 async processEvent(event: any): Promise<void> {
    const paymentId = event?.data?.id?.toString() || event?.resource?.toString();
    const eventType = event?.type || event?.topic;

    if (!paymentId) {
      console.log(`Skipping event, no payment id found. Event type: ${eventType}`);
      return;
    }

    if (eventType !== 'payment') {
      console.log(`Skipping non-payment event. Event type: ${eventType}`);
      return;
    }

    try {
      const paymentStrategy = this.paymentStrategyFactory.getStretegy(PROVIDERS.MP);
      const paymentCurrent = await paymentStrategy.verifyPayment(paymentId);

      if (!paymentCurrent) {
        console.log(`Payment not approved or not found. Payment ID: ${paymentId}`);
        return;
      }

     
      const reservationId = Array.isArray(paymentCurrent.reservationId)
        ? paymentCurrent.reservationId[0]
        : paymentCurrent.reservationId;

      const paymentFound = await this.paymentIntenRepo.findOneBy({
        external_reference: paymentCurrent.external_reference,
        reservation: { id: reservationId[0] },
      });

      if (!paymentFound) {
        console.log(`Payment found in MP but no corresponding reservation in DB. Payment ID: ${paymentId}`);
        return;
      }
      paymentFound.payer_email = paymentCurrent.payerEmail ?? 'n/a';
      paymentFound.payer_id = paymentCurrent.payerId ?? 'n/a';
      paymentFound.amount = paymentCurrent.amount?.toString() ?? '0';
      paymentFound.payer_name = paymentCurrent.payerName ?? 'n/a';
      paymentFound.payment_id = paymentCurrent.paymentId;
      paymentFound.payment_type = paymentCurrent.paymentMethod ?? 'n/a';
      paymentFound.status = PAYMENTS_STATUS.PAID;

      await this.paymentIntenRepo.save(paymentFound);

      console.log(`Payment processed successfully. Payment ID: ${paymentId}`);
    } catch (err) {
      console.error('Error processing payment:', err);
    }
  }

}




