import { forwardRef, Module } from '@nestjs/common';
import { PlacesService } from './places.service';
import { PlacesController } from './places.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Place } from './entities/place.entity';
import { City } from 'src/countries/entities/city.entity';
import { PlaceImages } from './entities/place-images.entity';
import { ImageLocalService } from 'src/common/helpers/imageLocalService';
import { Category } from 'src/categories/entities/category.entity';
import { BookingMode } from 'src/booking-mode/entities/booking-mode.entity';
import { QueueBullModule } from 'src/queue-bull/queue-bull.module';
import { AppLoggerModule } from 'src/logger/logger.module';
import { Location } from '../locations/entities/location.entity';
import { LocationsModule } from 'src/locations/locations.module';

@Module({
  imports:[TypeOrmModule.forFeature([Place,City,PlaceImages,Category,BookingMode,Location]),
            forwardRef(() => QueueBullModule),
            AppLoggerModule,
            LocationsModule,
],
  controllers: [PlacesController],
  providers: [PlacesService,ImageLocalService],
  exports:[PlacesService]
})
export class PlacesModule {}
