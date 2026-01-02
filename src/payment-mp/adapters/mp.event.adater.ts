import { PROVIDERS } from "src/common/Interfaces";
import { PaymentEvent } from "../interfaces/create.payment";



export class MpEventAdapter {

    static adapt(event: any): PaymentEvent | null {
        if (event.type !== 'payment') {
          return null;
        }

        return {
          provider: PROVIDERS.MP,
          eventType: 'payment_succeeded',
          providerEventId: event.id,
          paymentId: event?.data?.id?.toString() || event?.resource?.toString() || null,
          payload: event,
        };
      }

}