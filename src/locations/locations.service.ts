import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { InjectRepository } from '@nestjs/typeorm';


@Injectable()
export class LocationsService {

  constructor(@InjectRepository(Location) private readonly locationRepo:Repository<Location>){

  }

  async create(place_id:string,latitude:number,longitude:number) {
     try{
        await this.locationRepo.save({place:{id:place_id},latitude,longitude});
     }catch(error){
        console.log(error);
     }
  };

  findOne(id: number) {
    return `This action returns a #${id} location`;
  }

  update(id: number) {
    return `This action updates a #${id} location`;
  }

}
