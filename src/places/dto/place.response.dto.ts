



import { ApiProperty } from '@nestjs/swagger';
import { ImageResponseDto } from './image.response.dto';
import { Expose, Type } from 'class-transformer';
import { CategoryResponseDto } from 'src/categories/dto/category-response.dto';
import { BookingModeResponseDto } from 'src/booking-mode/dto/booking-mode-response.dto';
import { CityResponseDto } from 'src/countries/dto/country-response';
import { Location } from 'src/locations/entities/location.entity';
import { LocationResponseDto } from 'src/locations/dto/location.response.dto';
import { OpeningHour } from 'src/opening-hours/entities/opening-hour.entity';
import { OpeningHoursResponseDto } from 'src/opening-hours/dto/opening.reponse.dto';

export class PlaceResponseDto {
  
  @Expose()
  id: string;

  @Expose()
  name: string;


  @Expose()
  description: string;

  @Expose()
  address: string;

  @Expose()
  price: number;

  @Expose()
  @Type(()=>LocationResponseDto)
  location:LocationResponseDto;

  @Expose()
  @Type(()=>OpeningHoursResponseDto)
  opening_hours:OpeningHoursResponseDto;

  @Expose()
  @Type(() => ImageResponseDto)  
  images:ImageResponseDto[];


  @Expose()
  @Type(()=>CategoryResponseDto)
  category:CategoryResponseDto;


  @Expose()
  @Type(()=>BookingModeResponseDto)
  booking_mode:BookingModeResponseDto;


  @Expose()
  @Type(()=>CityResponseDto)
  city:CityResponseDto;


}


