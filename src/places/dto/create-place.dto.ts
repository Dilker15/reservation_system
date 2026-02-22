import { 
  IsString, 
  IsNumber, 
  IsUUID, 
  ValidateNested, 
  IsArray,
  ArrayUnique,
  IsOptional
} from 'class-validator';
import {Type } from 'class-transformer';
import { AvailabilityDto } from './availability.dto';

export class CreatePlaceDto {
 
  @IsString()
  name: string;

 
  @IsString()
  description: string;

 
  @IsString()
  address: string;


  @Type(()=>Number)
  @IsNumber()
  latitude:number;


  @Type(()=>Number)
  @IsNumber()
  longitude:number;

 

  
  @IsArray()
  @ArrayUnique((o: AvailabilityDto) => o.day)
  @ValidateNested({ each: true })
  @Type(() => AvailabilityDto)
  opening_hours: AvailabilityDto[];

  
  
  @Type(() => Number)
  @IsNumber()
  price: number;


  @IsUUID()
  city_id: string;

 
  @IsUUID()
  booking_mode_id: string;

  @IsUUID()
  category_id: string;


  @Type(() => Number)
  @IsNumber()
  max_guests: number;
  
  
  
  @Type(() => Number)
  @IsNumber()
  bedrooms: number;
  
  
  @Type(() => Number)
  @IsNumber()
  bathrooms: number;
  
  
  
  @Type(() => Number)
  @IsNumber()
  size_m2: number;


  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  amenity_ids?: string[];

  
}