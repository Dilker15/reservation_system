import { PROVIDERS } from "src/common/Interfaces";
import { MpEventAdapter } from "./mp.event.adater";

describe('MpEventAdapter', () => {

  it('should return null when event type is not payment', () => {
    const event = { type: 'charge' };

    const result = MpEventAdapter.adapt(event);

    expect(result).toBeNull();
  });
  it('should adapt payment event with data.id', () => {
    const event = {
      type: 'payment',
      id: 'evt_123',
      data: { id: 999 },
    };

    const result = MpEventAdapter.adapt(event);

    expect(result).toEqual({
      provider: PROVIDERS.MP,
      eventType: 'payment_succeeded',
      providerEventId: 'evt_123',
      paymentId: '999',
      payload: event,
    });
  });

  it('should adapt payment event with resource when data.id is missing', () => {
    const event = {
      type: 'payment',
      id: 'evt_456',
      resource: 555,
    };

    const result = MpEventAdapter.adapt(event);

    expect(result).toEqual({
      provider: PROVIDERS.MP,
      eventType: 'payment_succeeded',
      providerEventId: 'evt_456',
      paymentId: '555',
      payload: event,
    });
  });

});
