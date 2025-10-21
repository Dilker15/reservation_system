import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {v2 as Cloudinary, UploadApiResponse} from 'cloudinary';
import{ join } from 'path';
import { PlaceImages } from 'src/places/entities/place-images.entity';
import { Repository } from 'typeorm';
import { IImageUpload } from './interfaces/IUploadImages';
import { AppLoggerService } from 'src/logger/logger.service';

@Injectable()
export class ImageUploadService implements IImageUpload{

  private logger:AppLoggerService

  constructor(@Inject('CLOUDINARY') private readonly cloudinary:typeof Cloudinary,
  @InjectRepository(PlaceImages)private readonly imageRepo:Repository<PlaceImages>,
  private readonly appLoggerService:AppLoggerService,
){
      this.logger = this.appLoggerService.withContext(ImageUploadService.name);
  }

  async uploadImages(filesPath:string[]): Promise<UploadApiResponse[]> {
        try{
            const uploads: Promise<UploadApiResponse>[] = filesPath.map((filename) => {
              const filePath = join(process.cwd(), 'uploads', 'images', 'places', filename);
              return this.cloudinary.uploader.upload(filePath);
            });
            const results: UploadApiResponse[] = await Promise.all(uploads);
            return results;
        }catch(error){
          this.logger.error("error uploadImages ",error.trace)
          throw new InternalServerErrorException("Something was wrong uploading Images");
        }
  }

  
  deleteImage(publicId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  getImagesByPlace(placeId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  getImageById(id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }




  


  
}
