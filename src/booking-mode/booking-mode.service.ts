import { Injectable } from '@nestjs/common';
import { CreateBookingModeDto } from './dto/create-booking-mode.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { BookingMode } from './entities/booking-mode.entity';
import { Repository } from 'typeorm';
import { BookingModeResponseDto } from './dto/booking-mode-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class BookingModeService {

  constructor(@InjectRepository(BookingMode) private readonly bookingModeRepo:Repository<BookingMode>){

  }
  
  create(createBookingModeDto: CreateBookingModeDto):Promise<CreateBookingModeDto> {
    return Promise.resolve(createBookingModeDto);
  }


  async findAll():Promise<BookingModeResponseDto[]>{
    const modes = await this.bookingModeRepo.find({where:{is_active:true}});
    return this.parseBookingResponse(modes);
  }


  private parseBookingResponse(modes:BookingMode[]):BookingModeResponseDto[]{
    return plainToInstance(BookingModeResponseDto,modes,{excludeExtraneousValues:true});
  }
}
