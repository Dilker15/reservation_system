import { BadRequestException, Injectable } from "@nestjs/common";
import { PROVIDERS } from "src/common/Interfaces";
import { IPaymentProvider } from "../interfaces/PaymentProvider";
import { MercadoPagoStrategy } from "./MercadoPagoStrategy";
import { StripeStrategy } from "./StripeStrategy";







@Injectable()
export class PaymentStrategyFactory{

    constructor(private readonly mpStrategy:MercadoPagoStrategy,private readonly stripeStrategy:StripeStrategy){

    }

    

    getStretegy(provider:PROVIDERS):IPaymentProvider{
        switch (provider){
            case PROVIDERS.MP :
                return this.mpStrategy
            case PROVIDERS.STRIPE:
                return this.stripeStrategy
            default:
                throw new BadRequestException('Provider not found');
        }
    }
    

}