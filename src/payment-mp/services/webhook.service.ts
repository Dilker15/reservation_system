import { Injectable } from "@nestjs/common";
import { PaymentStrategyFactory } from "../strategies/PaymentStrategyFactory";
import { InjectRepository } from "@nestjs/typeorm";
import { PaymentIntent } from "../entities/payments.entity";
import { DataSource, In, Repository } from "typeorm";
import { EnqueueMailServices } from "src/queue-bull/enqueue-mail-services";
import { ParserNotificationData } from "src/common/helpers/parserNotificationData";
import { PaymentEvent } from "../interfaces/create.payment";
import { AppLoggerService } from "src/logger/logger.service";
import { EMAIL_TYPE, PAYMENTS_STATUS, PROVIDERS, RESERVATION_STATUS } from "src/common/Interfaces";
import { VerifyPaymentResult } from "../interfaces/create.payment";
import { Reservation } from "src/reservation/entities/reservation.entity";
import { ReservationService } from "src/reservation/reservation.service";



@Injectable()
export class WebHookService {

    private logger: AppLoggerService;

    constructor(private readonly paymentFactory:PaymentStrategyFactory,
                @InjectRepository(PaymentIntent) private readonly paymentIntentRepo:Repository<PaymentIntent>,
                private readonly dataSource:DataSource,
                private readonly enqueNotifications:EnqueueMailServices,
                private readonly parserToNotification:ParserNotificationData,
                private readonly loggerService:AppLoggerService,
                private readonly reservationService:ReservationService,

    ){
        this.logger = this.loggerService.withContext(WebHookService.name);
    }

    async processEvent(event:PaymentEvent): Promise<void> {
        const {provider,paymentId} = event;

        if(!paymentId){
            this.logger.log("Payment id not found in event - adapter");
            return;
        }
        
        if(await this.isPaymentAlreadyProcessed(paymentId)){ // VERIFY IDEMPOTENCY PAYMENTID.
            this.logger.log(`Payment already processed : ${paymentId}`);
            return;
        }

        let currentPayment;
        try{
            
            currentPayment = await this.verifyPaymentWithProvider(paymentId,provider);
            if(!currentPayment){
                this.logger.warn(`Payment not found or not paid : ${paymentId} - provider: ${provider}`);
                return;
            }

            if(await this.reservationService.reservationIsPaid(currentPayment.reservationId)){ 
               this.logger.log(`refund money  payment: ${paymentId} - provider : ${provider}`);
               return;
            }
            
            const paymentSaved = await this.processPaymentTransaction(currentPayment);
            if (!paymentSaved) return;
            await this.notifyReservationPayment(paymentSaved);
        }catch(error){
            this.logger.error(
              'Error on processEvent',
              error instanceof Error ? error.stack : JSON.stringify(error),
            );
        }
    }


    
    private async isPaymentAlreadyProcessed(paymentId: string): Promise<boolean> {
        const exists = await this.paymentIntentRepo.findOneBy({ payment_id: paymentId });
        return !!exists;
    }



    private async verifyPaymentWithProvider(paymentId: string,provider:PROVIDERS):Promise<VerifyPaymentResult|null> {
          const paymentStrategy = this.paymentFactory.getStretegy(provider);
          return await paymentStrategy.verifyPayment(paymentId);
    }




    private async processPaymentTransaction(paymentCurrent: VerifyPaymentResult):Promise<PaymentIntent|null>{
      return await this.dataSource.transaction(async (manager) => {

        const payment = await manager.findOne(PaymentIntent, {
          where: {
            external_reference: paymentCurrent.external_reference,
            reservation:{id:paymentCurrent.reservationId},
            status: PAYMENTS_STATUS.PENDING,
          },
          lock: { mode: 'pessimistic_write' },
        });
      
        if (!payment) {
          this.logger.warn(`payment succesfully but payment intent o reservation not found , Payment : ${paymentCurrent.paymentId} - Reservation : ${paymentCurrent.reservationId}`);
          return null
        };
      
       
        const fullPayment = await manager.findOne(PaymentIntent, {
          where: { id: payment.id },
          relations: {
            reservation: {
              place: {
                owner: true,
                booking_mode: true,
              },
              user: true,
            },
          },
        });
      
        this.mapPaymentResult(fullPayment!, paymentCurrent);
        fullPayment!.reservation.status = RESERVATION_STATUS.PAID;

        await manager.save(Reservation, fullPayment!.reservation);
        return await manager.save(PaymentIntent, fullPayment!);
        
      });  
    }
    



    private mapPaymentResult(payment: PaymentIntent,paymentCurrent: VerifyPaymentResult):void{
      payment.payer_email = paymentCurrent.payerEmail ?? '';
      payment.payer_id = paymentCurrent.payerId ?? '';
      payment.amount = String(paymentCurrent.amount ?? 0);
      payment.payment_id = paymentCurrent.paymentId;
      payment.payment_type = paymentCurrent.paymentMethod ?? '';
      payment.currency = paymentCurrent.currency;
      payment.status = PAYMENTS_STATUS.PAID;
    }
    


    private async notifyReservationPayment(payment:PaymentIntent):Promise<void>{
      const owner = payment.reservation.place.owner;
      const reservation = payment.reservation;
      const client = payment.reservation.user;
      const place = payment.reservation.place;
      const dataNotification = this.parserToNotification.parserNotificationConfirm(client,reservation,place);
      Promise.all([this.enqueNotifications.enqueEmail(EMAIL_TYPE.ADMIN_CONFIRM,{data:dataNotification,to:owner.email,notification_type:EMAIL_TYPE.ADMIN_CONFIRM}),
                   this.enqueNotifications.enqueEmail(EMAIL_TYPE.RESERVATION_CONFIRM,{data:dataNotification,to:owner.email,notification_type:EMAIL_TYPE.RESERVATION_CONFIRM})])
    }


    
}