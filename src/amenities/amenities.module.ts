import { Module } from '@nestjs/common';
import { AmenitiesService } from './amenities.service';
import { AmenitiesController } from './amenities.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Amenity } from './entities/amenity.entity';
import { AmenitiesPlace } from './entities/amanities_place.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Amenity,AmenitiesPlace])],
  controllers: [AmenitiesController],
  providers: [AmenitiesService],
})
export class AmenitiesModule {}
