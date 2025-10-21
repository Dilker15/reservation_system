import { Module } from '@nestjs/common';
import { ImageUploadService } from './image-upload.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfigOptions,v2 as cloudinary } from 'cloudinary';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaceImages } from 'src/places/entities/place-images.entity';
import { AppLoggerModule } from 'src/logger/logger.module';


@Module({
  imports:[ConfigModule,TypeOrmModule.forFeature([PlaceImages]),AppLoggerModule],
  controllers: [],
  providers: [
    ImageUploadService,
    
    {
      provide: 'CLOUDINARY',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const options: ConfigOptions = {
          cloud_name: configService.get('CLOUDINARY_CLOUD_NAME'),
          api_key: configService.get('CLOUDINARY_API_KEY'),
          api_secret: configService.get('CLOUDINARY_API_SECRET'),
        };

        cloudinary.config(options);
        return cloudinary;
      },
    }
  ],
  exports:[ImageUploadService]
})
export class ImageUploadModule {}
