import { 
  IsString, 
  IsNumber, 
  IsUUID, 
  ValidateNested 
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreatePlaceDto {
 
  @IsString()
  name: string;

 
  @IsString()
  description: string;

 
  @IsString()
  address: string;


  @IsString()
  location: string;

 
 
  @IsString()
  availability: string;

  
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