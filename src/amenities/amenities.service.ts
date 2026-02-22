import { Injectable } from '@nestjs/common';
import { CreateAmenityDto } from './dto/create-amenity.dto';
import { UpdateAmenityDto } from './dto/update-amenity.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Amenity } from './entities/amenity.entity';
import { Repository } from 'typeorm';
import { amenitiesData } from './data/amenities.data';

@Injectable()
export class AmenitiesService {

  constructor(@InjectRepository(Amenity) private readonly amenityRepository:Repository<Amenity>){

  }

  async create() {
    const count = await this.amenityRepository.count();
  
    if (count > 0) {
      console.log('Amenities already exist');
      return;
    }
  
    const amenities = this.amenityRepository.create(
      amenitiesData.map(item => ({
        name: item.name,
      }))
    );
  
    await this.amenityRepository.save(amenities);
    console.log('Amenities created successfully');
  }



  async findAll() {
    return this.amenityRepository.find({where:{is_active:true}});
  }

 
}
