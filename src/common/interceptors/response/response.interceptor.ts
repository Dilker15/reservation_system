import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {

  
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp().getResponse();
    const statusCode = ctx.statusCode;
    return next.handle().pipe(
      map((dat) => ({
        success: true,
        error:0,
        statusCode,
        message:"Success",
        timestamp: new Date(),
        data:dat?dat:{},
      })),
    );
  }
}
