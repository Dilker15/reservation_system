
import { MercadoPagoConfig } from 'mercadopago';
import { ConfigService } from '@nestjs/config';

export const MP_CONFIG = 'MP_CONFIG';

export const mpConfigProvider = {
  provide: MP_CONFIG,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    return new MercadoPagoConfig({
      accessToken: configService.getOrThrow('MERCADO_PAGO_TOKEN'),
      options: { timeout: 5000 },
    });
  },
};
