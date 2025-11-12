import { Module } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from './entities/location.entity';
import { AppLoggerModule } from 'src/logger/logger.module';

@Module({
  imports:[TypeOrmModule.forFeature([Location]),
      AppLoggerModule,
  ],
  controllers:[],
  providers: [LocationsService],
  exports:[LocationsService],
})
export class LocationsModule {}
