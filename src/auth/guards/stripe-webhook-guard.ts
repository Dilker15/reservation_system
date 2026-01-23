import { BadRequestException, CanActivate, ExecutionContext, Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Observable } from "rxjs";
import { STRIPE_CLIENT } from "src/payment-mp/stripe.config";
import Stripe from "stripe";



@Injectable()
export class StripeWebhookGuard implements CanActivate{

    constructor(@Inject(STRIPE_CLIENT) private readonly stripe: Stripe,private readonly confServ:ConfigService){

    }

     canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const req = context.switchToHttp().getRequest();
        const body = req.body;
        const rawBo = req.rawBody;
        const signature = req.headers['stripe-signature'];
        const webhookSecret = this.confServ.get<string>('STRIPE_WEBHOOK_SECRET');
        if(!signature){
            throw new BadRequestException('Signature has to be in headers');
        }
        if(!webhookSecret){
            throw new BadRequestException('webhook secret not configured');
        } 
        try{
            const event = this.stripe.webhooks.constructEvent(body,signature,webhookSecret);
            req.stripeEvent=event;
            return true;
        }catch(error){
            //console.log(error);
            throw new BadRequestException('Error validation sign');
        }
    }


}