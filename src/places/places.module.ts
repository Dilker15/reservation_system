import { Module } from '@nestjs/common';
import { PlacesService } from './places.service';
import { PlacesController } from './places.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Place } from './entities/place.entity';
import { City } from 'src/countries/entities/city.entity';
import { PlaceImages } from './entities/place-images.entity';
import { ImageLocalService } from 'src/common/helpers/imageLocalService';
import { ImageUploadModule } from 'src/image-upload/image-upload.module';
import { ImageUploadService } from 'src/image-upload/image-upload.service';

@Module({
  imports:[TypeOrmModule.forFeature([Place,City,PlaceImages]),
           ImageUploadModule,
],
  controllers: [PlacesController],
  providers: [PlacesService,ImageLocalService],
})
export class PlacesModule {}
