import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class MercadoPagoWebhookGuard implements CanActivate {
  private readonly logger = new Logger(MercadoPagoWebhookGuard.name);

  constructor(private readonly configService: ConfigService) {}

    canActivate(context: ExecutionContext): boolean {
      const req = context.switchToHttp().getRequest();
      const bo = req.body;
      const xSignature = req.headers['x-signature'];
      const xRequestId = req.headers['x-request-id'];
      if(!bo.action || ( bo.action && bo.action != 'payment.created')){
          return false;
      }

      if (!xSignature || !xRequestId) {
        return false;
      }

      const path = req._parsedUrl.query;
      const isValid = this.validateSignature(String(xSignature),String(xRequestId),path);

      if (!isValid) {
        this.logger.warn('Invalid Mercado Pago webhook signature (ignored)');
        return false;
      }
      this.logger.log('Mercado Pago webhook signature validated');
      return true;
    }


  private validateSignature(xSignature: string,xRequestId: string,path: string): boolean {
    try {
      let ts: string | undefined;
      let v1: string | undefined;
      const urlParams = new URLSearchParams(path);
      const dataID = urlParams.get('data.id');
  
      for (const part of xSignature.split(',')) {
        const [key, value] = part.split('=');
        if (key === 'ts') ts = value;
        if (key === 'v1') v1 = value;
      }
      if (!ts || !v1) return false;

      const secret = this.configService.get<string>('MERCADO_PAGO_WEBHOOK_SECRET');
      if (!secret) return false;

      const manifest = `id:${ dataID };request-id:${ xRequestId };ts:${ ts };` ;
      const hmac = crypto.createHmac('sha256',secret) ; 
      hmac.update ( manifest ) ;

      const sha = hmac.digest ( 'hex' ) ;
      
      return sha === v1;
       
    } catch {
      return false;
    }
  }
}
