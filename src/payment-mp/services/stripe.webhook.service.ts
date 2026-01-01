import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { IWebhook } from "../interfaces/WebHookStrategy";
import Stripe from "stripe";
import { InjectRepository } from "@nestjs/typeorm";
import { PaymentIntent } from "../entities/payments.entity";
import { DataSource, In, Repository } from "typeorm";
import { PaymentStrategyFactory } from "../strategies/PaymentStrategyFactory";
import { EMAIL_TYPE, PAYMENTS_STATUS, PROVIDERS, RESERVATION_STATUS } from "src/common/Interfaces";
import { VerifyPaymentResult } from "../interfaces/verify.payment";
import { Reservation } from "src/reservation/entities/reservation.entity";
import { EnqueueMailServices } from "src/queue-bull/enqueue-mail-services";
import { ParserNotificationData } from "src/common/helpers/parserNotificationData";


@Injectable()
export class StripeWebhookService implements IWebhook{
    

    constructor( @InjectRepository(PaymentIntent) private readonly paymentIntenRepo:Repository<PaymentIntent>,
                 private readonly paymentStrategyFact:PaymentStrategyFactory,
                 private readonly dataSource:DataSource,
                 private readonly enqueNotifications:EnqueueMailServices,
                 private readonly parserData:ParserNotificationData,
){              

    }


    async processEvent(event:Stripe.Event): Promise<void> {
        const {data,type} = event
        if(type != 'checkout.session.completed'){
            console.log("Skipping non-payment event");
            return;
        }
        const paymentId = data.object.payment_intent;
        if(!paymentId)return;

        if(await this.isPaymentAlreadyProcessed(paymentId as string)){
            console.log(`Payment already processed: ${paymentId}`);
            return;
        }
        try{
            const currentPayment = await this.verifyPaymentWithProvider(paymentId.toString());
            
            if(!currentPayment)return;

            const paymentSaved = await this.proccessPaymentTransaction(currentPayment);
            if(!paymentSaved)return;

            await this.enqueueNotification(paymentSaved)

        }catch(error){
            console.error(`CRITICAL: Failed to process payment ${paymentId}:`, error);
        }
    }


    private async isPaymentAlreadyProcessed(paymentId:string):Promise<boolean>{
        const paymentRegistered = await this.paymentIntenRepo.findOneBy({payment_id:paymentId});
        return !!paymentRegistered;
    }


    private async verifyPaymentWithProvider(paymentId:string){
        const paymentStrategy = this.paymentStrategyFact.getStretegy(PROVIDERS.STRIPE);
        return await paymentStrategy.verifyPayment(paymentId);
    }


    private async proccessPaymentTransaction(currentPayment:VerifyPaymentResult){
        return await this.dataSource.transaction(async(manager)=>{
            const paymentIntentFound = await manager.findOne(PaymentIntent,{
                where:{
                    reservation:{id:currentPayment.reservationId},
                    external_reference:currentPayment.external_reference,
                    status:In([PAYMENTS_STATUS.PENDING])
                },
                    relations:{
                        reservation:{
                            place:{
                                owner:true,
                                booking_mode:true,
                            },
                            user:true,
                        }
                },
            });
            if(!paymentIntentFound){
                console.log("PAYMENT NOT FOUND OR PAID.");
                return null;
            }
            const reservationPayment = await manager.findOne(Reservation,{
                where:{id:currentPayment.reservationId}
            });

            if(!reservationPayment){
                throw new InternalServerErrorException('Reservation not found to process');
            }
            paymentIntentFound.payer_email = currentPayment.payerEmail??'';
            paymentIntentFound.payer_id = currentPayment.payerId??'';
            paymentIntentFound.amount = currentPayment.amount?.toString()??'0';
            paymentIntentFound.payment_id = currentPayment.paymentId;
            paymentIntentFound.payment_type = currentPayment.paymentMethod??'n/a';
            paymentIntentFound.currency = currentPayment.currency;
            paymentIntentFound.status = PAYMENTS_STATUS.PAID;
            reservationPayment.status = RESERVATION_STATUS.PAID;
            await manager.save(Reservation,reservationPayment);
            return await manager.save(PaymentIntent,paymentIntentFound);
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


