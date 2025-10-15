import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {v2 as Cloudinary, UploadApiResponse} from 'cloudinary';
import{ join } from 'path';
import { PlaceImages } from 'src/places/entities/place-images.entity';
import { Repository } from 'typeorm';
import { IImageUpload } from './interfaces/IUploadImages';

@Injectable()
export class ImageUploadService implements IImageUpload{

  constructor(@Inject('CLOUDINARY') private readonly cloudinary:typeof Cloudinary,
  @InjectRepository(PlaceImages)private readonly imageRepo:Repository<PlaceImages>){
    
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
          console.log(error);
          throw error;
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
