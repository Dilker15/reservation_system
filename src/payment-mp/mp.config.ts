
import { MercadoPagoConfig } from 'mercadopago';
import { ConfigService } from '@nestjs/config';

export const MP_CONFIG = 'MP_CONFIG';

export const mpConfigProvider = {
  provide: MP_CONFIG,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    return new MercadoPagoConfig({
      accessToken: configService.getOrThrow('MERCADO_PAGO_TOKEN'),// it should be changed for seller_token MARKET_PLACE MODE.
      options: { timeout: 5000 },
    });
  },
};
