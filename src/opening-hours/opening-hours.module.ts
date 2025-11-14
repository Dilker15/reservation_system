import { Module } from '@nestjs/common';
import { OpeningHoursService } from './opening-hours.service';
import { OpeningHoursController } from './opening-hours.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OpeningHour } from './entities/opening-hour.entity';
import { PlacesModule } from 'src/places/places.module';
import { AppLoggerModule } from 'src/logger/logger.module';

@Module({
  imports:[TypeOrmModule.forFeature([OpeningHour]),PlacesModule,AppLoggerModule],
  controllers: [OpeningHoursController],
  providers: [OpeningHoursService],
})
export class OpeningHoursModule {}
