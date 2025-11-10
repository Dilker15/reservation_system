import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Place } from 'src/places/entities/place.entity';
import { UpdateLocationDto } from './dto/update.location.dto';
import { AppLoggerService } from 'src/logger/logger.service';


@Injectable()
export class LocationsService {

  private logger : AppLoggerService;
  constructor(@InjectRepository(Location) private readonly locationRepo:Repository<Location>,
               private readonly appLogService:AppLoggerService,
  ){
    this.logger = this.appLogService.withContext(LocationsService.name);
  }

  async create(myPlace:Place,latitude:number,longitude:number,manager?:EntityManager) {
        const repo = manager ? manager.getRepository(Location) : this.locationRepo;
        await repo.save({place:myPlace,latitude,longitude});
  };



 
  async updateByPlace(place_id:string,updateDto:UpdateLocationDto){
     const locationFound = await this.locationRepo.findOne({where:{place:{id:place_id}}});
     if(!locationFound){
       this.logger.error("Error on UpdateLocationByPlace place Doest not have a location");
       throw new BadRequestException(`Error on updateLocation with place id : ${place_id}`);
     }
     Object.assign(locationFound,updateDto);
     locationFound.updated_at = new Date();
    await this.locationRepo.save(locationFound);
    this.logger.log("Location updated succesfully");
    return locationFound;
  }


  

}
