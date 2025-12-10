import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PreferencesMp } from './preference.service';
import { PaymentProvider } from '../strategies/PaymentProvider';
import { PaymentStrategyFactory } from '../strategies/PaymentStrategyFactory';
import { PROVIDERS } from 'src/common/Interfaces';

@Injectable()
export class PaymentMpService {


  constructor(private readonly preferences: PreferencesMp,private readonly paymentStrategy:PaymentStrategyFactory) {}

  async payTest() { // TEST MP INTEGRATIONS.
    try{
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
  
        notification_url: "https://webhook.site/be335547-d85a-41ae-8e49-e45331cd6d73",
      });
  
      console.log(preference);
      return {
        preferenceId: preference.id,
        url: preference.init_point,
        test:preference.sandbox_init_point
      };

    }catch(error){
       console.log(error);
       return new InternalServerErrorException("UnExpected Error on payment")
    }
   
  }
}
