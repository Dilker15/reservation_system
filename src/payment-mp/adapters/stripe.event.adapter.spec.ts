import { PROVIDERS } from "src/common/Interfaces";
import { StripeEventAdapter } from "./stripe.event.adapter";
import Stripe from "stripe";



describe('StripeEventAdapter', () => {

  it('should return null when event type is not checkout.session.completed', () => {
    const event = {
      id: 'evt_test',
      type: 'payment_intent.succeeded',
    } as Stripe.Event;

    const result = StripeEventAdapter.adapt(event);

    expect(result).toBeNull();
  });

  it('should adapt checkout.session.completed event correctly', () => {
    const event = {
        id: 'evt_123',
        type: 'checkout.session.completed',
        data: {
        object: {
            payment_intent: 'pi_456',
        },
        },
    } as unknown as Stripe.Event;

    const result = StripeEventAdapter.adapt(event);

    expect(result).toEqual({
        provider: PROVIDERS.STRIPE,
        eventType: 'payment_succeeded',
        providerEventId: 'evt_123',
        paymentId: 'pi_456',
        payload: undefined,
    });
    });


});
