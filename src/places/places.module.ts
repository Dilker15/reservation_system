import { forwardRef, Module } from '@nestjs/common';
import { PlacesService } from './places.service';
import { PlacesController } from './places.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Place } from './entities/place.entity';
import { City } from 'src/countries/entities/city.entity';
import { PlaceImages } from './entities/place-images.entity';
import { ImageLocalService } from 'src/common/helpers/imageLocalService';
import { ImageUploadModule } from 'src/image-upload/image-upload.module';
import { ImageUploadService } from 'src/image-upload/image-upload.service';
import { Category } from 'src/categories/entities/category.entity';
import { BookingMode } from 'src/booking-mode/entities/booking-mode.entity';
import { EnqueueImagesUploadServices } from 'src/queue-bull/enqueue-images.services';
import { QueueBullModule } from 'src/queue-bull/queue-bull.module';
import { AppLoggerModule } from 'src/logger/logger.module';

@Module({
  imports:[TypeOrmModule.forFeature([Place,City,PlaceImages,Category,BookingMode]),
            forwardRef(() => QueueBullModule),
            AppLoggerModule,
],
  controllers: [PlacesController],
  providers: [PlacesService,ImageLocalService],
  exports:[PlacesService]
})
export class PlacesModule {}
