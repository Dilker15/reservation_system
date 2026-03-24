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
        return new Redis({
          host: config.get<string>('REDIS_CACHE_HOST'),
          port: config.get<number>('REDIS_CACHE_PORT'),
        });
      },
    },
    CacheRedisService
  ],
  exports:[
    CacheRedisService,
  ]
})
export class CacheRedisModule {}
