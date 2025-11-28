import { Injectable } from '@nestjs/common';
import { PreferencesMp } from './preference.service';

@Injectable()
export class PaymentMpService {
  constructor(private readonly preferences: PreferencesMp) {}

  async payTest() {
    const preference = await this.preferences.createPreference({
      items: [
        { title: "Producto 1", quantity: 1, unit_price: 25 , description: "Descripción del producto 1" ,id:1,},
        { title: "Producto 2", quantity: 1, unit_price: 300 , description: "Descripción del producto 2", id:2},
      ],

      backUrls: {
        success: "https://www.test.com/success",
        failure: "https://www.test.com/failure",
        pending: "https://www.test.com/pending",
      },
       auto_return: "approved",


      metadata: {
        orderId: "order_uuid_test-reservation-system"
      },

      notificationUrl: "https://tu-api.com/mercadopago/webhook",
    });

    return {
      preferenceId: preference.id,
      url: preference.init_point,
      test:preference.sandbox_init_point
    };
  }
}
