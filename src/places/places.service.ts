import { Inject, Injectable } from '@nestjs/common';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { ImageUploadService } from 'src/image-upload/image-upload.service';
import { Multer } from 'multer';
import { InjectRepository } from '@nestjs/typeorm';
import { Place } from './entities/place.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PlacesService {
  constructor(private readonly uploadServices:ImageUploadService,@InjectRepository(Place) private readonly placeRepo:Repository<Place>){

  }

  async create(createPlaceDto: CreatePlaceDto,pathImages:string[]) {
    try{
       const imagesUploaded = await this.uploadServices.uploadImages(pathImages);
       return imagesUploaded;
    }catch(error){
      
      console.log(error);
    }
  }

  findAll() {
    return `This action returns all places`;
  }

  findOne(id: number) {
    return `This action returns a #${id} place`;
  }

  update(id: number, updatePlaceDto: UpdatePlaceDto) {
    return `This action updates a #${id} place`;
  }

  remove(id: number) {
    return `This action removes a #${id} place`;
  }
}
