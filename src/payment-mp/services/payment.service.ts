import { Injectable, NotFoundException,InternalServerErrorException, Provider, BadRequestException} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { v4 as uuidv4 } from 'uuid';
import { PaymentStrategyFactory } from "../strategies/PaymentStrategyFactory";
import { CreatePaymentData, CreatePaymentResponse } from "../interfaces/create.payment";
import { Reservation } from "src/reservation/entities/reservation.entity";
import { PROVIDERS, RESERVATION_STATUS } from "src/common/Interfaces";
import { PaymentIntent } from "../entities/payments.entity";
import { PaymentAccount } from "src/payment_accounts/entities/payment_account.entity";


@Injectable()
export class PaymentService {
    
    private urlWebhook = '/api/v1/reservations/webhook'

    constructor(
        private readonly paymentFactory: PaymentStrategyFactory,
        @InjectRepository(Reservation) private readonly reservationRepo: Repository<Reservation>,
        private readonly configService: ConfigService,
        @InjectRepository(PaymentIntent) private readonly paymentIntentRepo: Repository<PaymentIntent>,
    ) {}

    async createPayment(reservationId: string, provider: PROVIDERS): Promise<CreatePaymentResponse> {
        
       
        const reservation = await this.reservationRepo.findOne({
            where: { id: reservationId, status: RESERVATION_STATUS.CREATED },
            relations: {
                place:{
                    owner:{
                        payment_accounts:true
                    }
                }
            }
        });

       
        if (!reservation) {
            throw new NotFoundException("Reservation not found or payment already initiated/completed");
        }
        const paymentAccountVendor = reservation?.place.owner.payment_accounts;
        if(paymentAccountVendor?.length === 0){
            throw new NotFoundException("Payment method not found for this place");
        }
        
        
        const intentId = this.generateIntentId();
        const paymentData = this.mapReservationToPaymentData(reservation, provider, intentId);
        
        try {
            const account = this.getPaymentAccountOrFail(paymentAccountVendor!,provider);
            const strategy = this.paymentFactory.getStretegy(provider);
            const preference = await strategy.createPayment(paymentData,account);
            
          
            await this.paymentIntentRepo.save({
                external_reference: preference.external_reference,
                preference_id: preference.preference_id,
                preference_link: preference.url,
                provider: provider,
                reservation,
            });

            return {
                payment_link: preference.url!,
                provider: paymentData.provider,
                reservation: reservation.id,
            };

        } catch (error) {
            throw new InternalServerErrorException(`Failed to create payment preference with provider ${provider}.`);
        }
    }



    private mapReservationToPaymentData( reservation: Reservation,provider: PROVIDERS,intentId: string): CreatePaymentData {
       
        const totalAmount = reservation.amount * reservation.total_price;
        const config = (key: string) => this.configService.get<string>(key);

        return {
            provider,
            reservationId: reservation.id,
            amount: totalAmount,
            currency: provider == PROVIDERS.MP? 'ARS' : 'USD',         // TODO: make currency configurable by the webmaster in the future
            
            items: [{
                name: reservation.place.name,
                id: reservation.id,
                quantity: reservation.amount,
                unit_price: reservation.total_price,
                title: reservation.place.name,
                description: reservation.place.description,
            }],
            metadata: {
                reservationId: reservation.id,
            },
            auto_return: "approved",
            back_urls: {
                failure: config('BACK_URL_FAILURE')!,
                pending: config('BACK_URL_PENDING')!,
                success: config('BACK_URL_SUCCESS')!,
            },
            intent_id: intentId,
            notification_url: this.generateUrlNotification(provider)
        };
    }

    private generateUrlNotification(provider:PROVIDERS):string{
        const urlApp = this.configService.get<string>('APP_URL') + `${this.urlWebhook}/${provider}`;
        return urlApp;
    }

    private generateIntentId():string{
        return uuidv4();
    }


    private getPaymentAccountOrFail(paymentAccounts: PaymentAccount[],provider: PROVIDERS): PaymentAccount {
        const account = paymentAccounts.find(acc => acc.provider === provider);
        if (!account) {
          throw new BadRequestException(`Payment account for provider ${provider} not found`);
        }
        return account;
    }
      
      
}





