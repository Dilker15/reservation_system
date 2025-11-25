import { Type } from "class-transformer";
import { IsDateString, IsNumber, IsOptional } from "class-validator";




export class CalendarAvailabityDto{

    @IsOptional()
    @IsDateString()
    start_date?: string;
  
  
    @IsOptional()
    @IsDateString()
    end_date?: string;

}