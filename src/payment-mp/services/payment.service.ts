import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { PaymentStrategyFactory } from "../strategies/PaymentStrategyFactory";
import { CreatePaymentData, CreatePaymentResponse } from "../interfaces/create.payment";
import { InjectRepository } from "@nestjs/typeorm";
import { Reservation } from "src/reservation/entities/reservation.entity";
import { Repository } from "typeorm";
import { PROVIDERS, RESERVATION_STATUS } from "src/common/Interfaces";
import { ConfigService } from "@nestjs/config";
import { PaymentIntent } from "../entities/payments.entity";
import { id } from "date-fns/locale";



@Injectable()
export class PaymentService{

    constructor(private readonly paymentFactory:PaymentStrategyFactory,
                @InjectRepository(Reservation) private readonly reservationRepo:Repository<Reservation>,
                private readonly configService:ConfigService,
                @InjectRepository(PaymentIntent) private readonly paymentIntentRepo:Repository<PaymentIntent>,
    ){

    }


    async createPayment(reservationId: string, provider: PROVIDERS):Promise<CreatePaymentResponse> {

        const reservation = await this.reservationRepo.findOne({
            where: { id: reservationId, status: RESERVATION_STATUS.CREATED },
            relations: ['place']
        });
    
        if (!reservation) {
            throw new NotFoundException("Reservation not found");
        }
    
       
    
        const strategy = this.paymentFactory.getStretegy(provider);
    
        const data: CreatePaymentData = {
            provider,
            reservationId: reservation.id,
    
            amount: reservation.amount * reservation.total_price,
            currency: 'ARS',
    
            items: [
                {
                    name:reservation.place.name,
                    id: reservation.id,
                    quantity: reservation.amount,
                    unit_price: reservation.total_price,
                    title: reservation.place.name,
                    description: reservation.place.description,
                }
            ],
    
            metadata: {
                reservationId: reservation.id,
            },
    
            auto_return: "approved",
    
            back_urls: {
                failure: this.configService.get('BACK_URL_FAILURE')!,
                pending: this.configService.get('BACK_URL_PENDING')!,
                success: this.configService.get('BACK_URL_SUCCESS')!,
            },
    
            notification_url: this.configService.get('NOTIFICATION_URL')!,
        };
        
        try{
            const preference = await strategy.createPayment(data);
            const paymentIntent = await this.paymentIntentRepo.save({
                external_reference:preference.external_reference,
                preference_id:preference.id,
                preference_link:preference.init_point,
                provider:provider,
                reservation,
            });
            console.log(paymentIntent);
            return {
                    intentPaymentId:preference.id!,
                    paymentLink:preference.init_point!,
                    provider:data.provider,
                    raw:preference.external_reference,
            }
        }catch(error){
            console.log(error);
            throw new InternalServerErrorException("Error on payments");
        }
       
    }
    


    







}