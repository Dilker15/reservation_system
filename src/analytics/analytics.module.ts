import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { CacheRedisModule } from 'src/cache-redis/cache-redis.module';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  imports:[CacheRedisModule]
})
export class AnalyticsModule {}
