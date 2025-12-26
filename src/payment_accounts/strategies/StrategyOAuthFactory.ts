import { BadRequestException, Injectable } from "@nestjs/common";
import { MercadoPagoOAuthStrategy } from "./Mp0AuthStrategy";
import { StripeOAuthStrategy } from "./Stripe0AuthStrategy";
import { PROVIDERS } from "src/common/Interfaces";


@Injectable()
export class OAuthFactory{

    constructor(private readonly mpStrategy:MercadoPagoOAuthStrategy,
                private readonly stripeStrategy:StripeOAuthStrategy,
    ){
    }

    getStrategy(provider:string){
        switch (provider){
            case PROVIDERS.MP :
                return this.mpStrategy;
            case PROVIDERS.STRIPE:
                return this.stripeStrategy;
            default:
                throw new BadRequestException(`Providers permMited : ${PROVIDERS.MP} , ${PROVIDERS.STRIPE}`);
        }
    }
}