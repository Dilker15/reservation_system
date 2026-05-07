import { Module } from '@nestjs/common';
import { CacheRedisService } from './cache-redis.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { REDIS_CACHE } from './constans/redist.constants';
import Redis from 'ioredis';


@Module({
  imports:[ConfigModule],
  providers: [
    {
      provide:REDIS_CACHE,
      inject:[ConfigService],
      useFactory: (config: ConfigService) => {
        return new Redis(
          config.get<string>('REDIS_CACHE_URL')!,
          {
            maxRetriesPerRequest: null
          }
        );
      }
    },
    CacheRedisService
  ],
  exports:[
    CacheRedisService,
  ]
})
export class CacheRedisModule {}
