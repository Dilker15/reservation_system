import { 
  IsString, 
  IsNumber, 
  IsUUID, 
  ValidateNested 
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AvailabilityDto } from './availability.dto';
import { LocationDto } from './location.dto';

export class CreatePlaceDto {
 
  @IsString()
  name: string;

 
  @IsString()
  description: string;

 
  @IsString()
  address: string;


  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

 
 
  @ValidateNested()
  @Type(() => AvailabilityDto)
  availability: AvailabilityDto;

  
  @Type(() => Number)
  @IsNumber()
  price: number;


  @IsUUID()
  city_id: string;

 
  @IsUUID()
  booking_mode_id: string;

  @IsUUID()
  category_id: string;
}