import { 
  IsString, 
  IsNumber, 
  IsUUID, 
  ValidateNested, 
  IsArray,
  ArrayUnique
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
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
}