import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Observable } from "rxjs";



@Injectable()
export class MercadoPagoWebhookGuard implements CanActivate{

    constructor(private readonly configServ:ConfigService){

    }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
      
        const req = context.switchToHttp().getRequest<Request>();
        const headers = req.headers;
        const signature = headers['x-signature'];
        const requestId = headers['x-request-id'];
      
        return this.isValidSignature(signature,requestId);
    }


    private isValidSignature(signature:string,requestId:string):boolean{
        console.log("SIGNATURE : ",signature);
        console.log("REQUEST-ID: ",requestId);
        console.log("SECRET-MP: ",this.configServ.get<string>('MERCADO_PAGO_WEBHOOK_SECRET'));
        return false;
    }



}