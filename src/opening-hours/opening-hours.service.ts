import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOpeningHourDto } from './dto/create-opening-hour.dto';
import { UpdateOpeningHourDto } from './dto/update-opening-hour.dto';
import { User } from 'src/users/entities/user.entity';
import { PlacesService } from 'src/places/places.service';
import { InjectRepository } from '@nestjs/typeorm';
import { OpeningHour } from './entities/opening-hour.entity';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { OpeningHoursResponseDto } from './dto/opening.reponse.dto';
import { AppLoggerService } from 'src/logger/logger.service';

@Injectable()
export class OpeningHoursService {
  private logger:AppLoggerService;
  constructor(private readonly placeService:PlacesService,@InjectRepository(OpeningHour) private readonly openingRepo:Repository<OpeningHour>,
              private readonly loggerServ:AppLoggerService,
  ){
      this.logger = loggerServ.withContext(OpeningHour.name);
  }
 

  async update(id: string, updateOpeningHourDto: UpdateOpeningHourDto,owner:User):Promise<OpeningHoursResponseDto> {
    const {place_id} = updateOpeningHourDto;
    await this.placeService.findOne(place_id,owner);
    const openingHour = await this.openingRepo.findOne({where:{id}});
    if(!openingHour){

      throw new NotFoundException('Opening hour not found');
    }
    openingHour.close_time = updateOpeningHourDto.close_time;
    openingHour.open_time = updateOpeningHourDto.open_time;
    await this.openingRepo.save(openingHour);
    this.logger.log("opening hour updated");
    return this.parseOpeningHourResponseDto(openingHour);
  }



  async remove(hour_id:string,place_id:string,owner:User):Promise<OpeningHoursResponseDto>{
     await this.placeService.findOne(place_id,owner);
     const hourFound = await  this.openingRepo.findOne({where:{id:hour_id,is_active:true,place:{id:place_id}}});
     if(!hourFound){
       throw new NotFoundException("Hour to remove not Found");
     }
     await this.openingRepo.remove(hourFound);
     this.logger.log("opening hour removed :" + hour_id);
     return this.parseOpeningHourResponseDto(hourFound);
  } 




  private parseOpeningHourResponseDto(opening:OpeningHour):OpeningHoursResponseDto{
      return plainToInstance(OpeningHoursResponseDto,opening,{excludeExtraneousValues:true})
  }











  
}
