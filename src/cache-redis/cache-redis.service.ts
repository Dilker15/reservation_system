import { Inject, Injectable } from '@nestjs/common';
import { REDIS_CACHE } from './constans/redist.constants';
import Redis from 'ioredis';

@Injectable()
export class CacheRedisService {
 

  constructor(@Inject(REDIS_CACHE) private readonly redis:Redis){

  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttl?: number) {
    const stringValue = JSON.stringify(value);

    if (ttl) {
      await this.redis.set(key, stringValue, 'EX', ttl);
    } else {
      await this.redis.set(key, stringValue);
    }
  }

  async del(key: string) {
    await this.redis.del(key);
  }

  async reset() {
    await this.redis.flushdb();
  }
}
