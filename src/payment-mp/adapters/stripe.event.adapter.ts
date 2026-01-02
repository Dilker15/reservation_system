import Stripe from "stripe";
import { PaymentEvent } from "../interfaces/create.payment";
import { PROVIDERS } from "src/common/Interfaces";


export class StripeEventAdapter {


    static adapt(event: Stripe.Event): PaymentEvent | null {
      if (event.type !== 'checkout.session.completed') {
        return null;
      }
  
      const session = event.data.object as Stripe.Checkout.Session;
  
      return {
        provider: PROVIDERS.STRIPE,
        eventType: 'payment_succeeded',
        providerEventId: event.id,
        paymentId: session.payment_intent as string,
        payload: event.object,
      };
    }
  }
  