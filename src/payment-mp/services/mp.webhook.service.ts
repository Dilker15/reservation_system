import {Injectable, InternalServerErrorException } from "@nestjs/common";
import { IWebhook } from "../interfaces/WebHookStrategy";
import { PaymentStrategyFactory } from "../strategies/PaymentStrategyFactory";
import { EMAIL_TYPE, PAYMENTS_STATUS, PROVIDERS, RESERVATION_STATUS } from "src/common/Interfaces";
import { InjectRepository } from "@nestjs/typeorm";
import { PaymentIntent } from "../entities/payments.entity";
import { DataSource, In, Not, Repository } from "typeorm";
import { ParserNotificationData } from "src/common/helpers/parserNotificationData";
import { EnqueueMailServices } from "src/queue-bull/enqueue-mail-services";
import { Reservation } from "src/reservation/entities/reservation.entity";
import { VerifyPaymentResult } from "../interfaces/verify.payment";



@Injectable()
export class MercadoPagoWeebHookService implements IWebhook{

    constructor(private readonly paymentStrategyFactory:PaymentStrategyFactory,
                @InjectRepository(PaymentIntent) private readonly paymentIntenRepo:Repository<PaymentIntent>,
                private readonly dataSource:DataSource,
                private readonly parserData:ParserNotificationData,
                private readonly enqueNotifications:EnqueueMailServices,
              ){
                
    }

 

    // PHASE 1 - CRITICAL (do first):
    // TODO: Create WebhookLog entity and save raw webhook before processing
    // TODO: Respond 200 immediately to MP (move processEvent to async)

    // PHASE 2 - IMPORTANT:
    // TODO: Wrap save() in transaction with webhook_log update
    // TODO: Don't throw in catch, mark as 'failed' in DB

    // PHASE 3 - IMPROVEMENT:
    // TODO: Create cron job to reprocess failed webhooks every 5 min
    // TODO: Dashboard to monitor pending/failed webhooks

        
    async processEvent(event: any): Promise<void> {
      const paymentId = this.extractPaymentId(event);
      const eventType = this.extractEventType(event);

      if (!this.isPaymentEvent(eventType)) {
        console.log('Skipping non-payment event');
        return;
      }

      if (!paymentId) return;

      if (await this.isPaymentAlreadyProcessed(paymentId)) {
        console.log(`Payment already processed: ${paymentId}`);
        return;
      }

      try {
        const paymentCurrent = await this.verifyPaymentWithProvider(paymentId);
        if (!paymentCurrent) {
          console.log(`Payment not approved or not found. Payment ID: ${paymentId}`);
          return;
        }

        const reservationId = this.getReservationId(paymentCurrent);

        const paymentSaved = await this.processPaymentTransaction(paymentCurrent, reservationId);
        if (!paymentSaved) return;

        console.log(`Payment processed successfully. Payment ID: ${paymentId}`);

        await this.enqueueNotification(paymentSaved);

      } catch (err) {
        console.error(`CRITICAL: Failed to process payment ${paymentId}:`, err);
      }
    }


    private extractPaymentId(event: any): string | null {
      return event?.data?.id?.toString() || event?.resource?.toString() || null;
    }

    private extractEventType(event: any): string | null {
      return event?.type || event?.topic || null;
    }


    private isPaymentEvent(eventType: string | null): boolean {
      return eventType === 'payment';
    }


    private async isPaymentAlreadyProcessed(paymentId: string): Promise<boolean> {
      const exists = await this.paymentIntenRepo.findOneBy({ payment_id: paymentId });
      return !!exists;
    }


    private async verifyPaymentWithProvider(paymentId: string) {
      const paymentStrategy = this.paymentStrategyFactory.getStretegy(PROVIDERS.MP);
      return await paymentStrategy.verifyPayment(paymentId);
    }


    private getReservationId(paymentCurrent: any): string {
      const reservationId = Array.isArray(paymentCurrent.reservationId)
        ? paymentCurrent.reservationId[0]
        : paymentCurrent.reservationId;

      return reservationId;
    }

    private async processPaymentTransaction(paymentCurrent:VerifyPaymentResult, reservationId: string) {
      return await this.dataSource.transaction(async (manager) => {
        const paymentFound = await manager.findOne(PaymentIntent, {
          where: {
            external_reference: paymentCurrent.external_reference,
            status: In([PAYMENTS_STATUS.CREATED]),
            reservation: { id: reservationId[0]},
          },
          relations:{
            reservation:{
                place:{
                    owner:true,
                    booking_mode:true,
                },
                user:true,
            }
          }
        });

        const reservationFound = await manager.findOne(Reservation,{
           where:{
            id:reservationId[0],
           }
        });
        if(!reservationFound){
           throw new InternalServerErrorException('Reservation not found to process');
        }
        if (!paymentFound) {
          console.log(
            `Payment found in MP but no corresponding reservation in DB or already PAID: ${paymentCurrent.paymentId}`
          );
          return null;
        }

        paymentFound.payer_email = paymentCurrent.payerEmail ?? 'n/a';
        paymentFound.payer_id = paymentCurrent.payerId ?? 'n/a';
        paymentFound.amount = paymentCurrent.amount?.toString() ?? '0';
        paymentFound.payment_id = paymentCurrent.paymentId;
        paymentFound.payment_type = paymentCurrent.paymentMethod ?? 'n/a';
        paymentFound.currency = paymentCurrent.currency;
        paymentFound.status = PAYMENTS_STATUS.PAID;
        reservationFound.status = RESERVATION_STATUS.PAID;
        await manager.save(Reservation,reservationFound);
        return await manager.save(PaymentIntent, paymentFound);
      });
    }


    private async enqueueNotification(paymentSaved: PaymentIntent) {
      try {
          const owner = paymentSaved.reservation.place.owner;
          const reservation = paymentSaved.reservation;
          const client = paymentSaved.reservation.user;
          const place = paymentSaved.reservation.place;

          const dataNotification = this.parserData.parserNotificationConfirm(client,reservation,place);
          
         
          Promise.all([this.enqueNotifications.enqueEmail(EMAIL_TYPE.ADMIN_CONFIRM,{data:dataNotification,to:owner.email,notification_type:EMAIL_TYPE.ADMIN_CONFIRM}),
                      this.enqueNotifications.enqueEmail(EMAIL_TYPE.RESERVATION_CONFIRM,{data:dataNotification,to:owner.email,notification_type:EMAIL_TYPE.RESERVATION_CONFIRM})])
          console.log(`Notification queued successfully for payment: ADMIN - CLIENT ${paymentSaved.payment_id}`);
      } catch (queueError: any) {
          console.error(
            `QUEUE_ENQUEUE_FAILED: Could not enqueue notification for payment ${paymentSaved.payment_id}. ` +
            `Payment is saved in DB (ID: ${paymentSaved.id}). ` +
            `Error: ${queueError.message}`,
            queueError.stack
          );
      }
    }


}




