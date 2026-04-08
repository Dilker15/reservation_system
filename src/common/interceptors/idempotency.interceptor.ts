import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { of, tap } from "rxjs";
import { CacheRedisService } from "src/cache-redis/cache-redis.service";



@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(private readonly redisService: CacheRedisService) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest();
    const key = req.headers['idempotency-key'];
    if (!key) return next.handle();

    const cached = await this.redisService.get(key);

    if (cached) {
      return of(cached);
    }

    return next.handle().pipe(
      tap(async (response) => {
        await this.redisService.set(key, JSON.stringify(response),3600);
      }),
    );
  }
}