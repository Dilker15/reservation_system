import { Module } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from './entities/location.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Location])],
  controllers:[],
  providers: [LocationsService],
  exports:[LocationsService],
})
export class LocationsModule {}
