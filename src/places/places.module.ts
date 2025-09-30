import { Module } from '@nestjs/common';
import { PlacesService } from './places.service';
import { PlacesController } from './places.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Place } from './entities/place.entity';
import { City } from 'src/countries/entities/city.entity';
import { PlaceImages } from './entities/place-images.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Place,City,PlaceImages])],
  controllers: [PlacesController],
  providers: [PlacesService],
})
export class PlacesModule {}
