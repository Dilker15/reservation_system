



import { ApiProperty } from '@nestjs/swagger';
import { ImageResponseDto } from './image.response.dto';
import { Expose, Type } from 'class-transformer';
import { CategoryResponseDto } from 'src/categories/dto/category-response.dto';
import { BookingModeResponseDto } from 'src/booking-mode/dto/booking-mode-response.dto';
import { CityResponseDto } from 'src/countries/dto/country-response';

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
  location: string;

  @Expose()
  availability: string;

  @Expose()
  @Type(() => ImageResponseDto)  
  images:ImageResponseDto[];


  @Expose()
  @Type(()=>CategoryResponseDto)
  category:CategoryResponseDto;


  @Expose()
  @Type(()=>BookingModeResponseDto)
  booking:BookingModeResponseDto;


  @Expose()
  @Type(()=>CityResponseDto)
  city:CityResponseDto;


}


