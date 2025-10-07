import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {v2 as Cloudinary} from 'cloudinary';
import { promises as fs } from 'fs';
import path from 'path';
import { PlaceImages } from 'src/places/entities/place-images.entity';
import { Repository } from 'typeorm';
import { IImageUpload } from './interfaces/IUploadImages';

@Injectable()
export class ImageUploadService implements IImageUpload{

  constructor(@Inject('CLOUDINARY') private readonly cloudinary:typeof Cloudinary,
  @InjectRepository(PlaceImages)private readonly imageRepo:Repository<PlaceImages>){
    
  }

  uploadImages(files: Express.Multer.File[]): Promise<void> {
    throw new Error('Method not implemented.');
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
