
import { 
  IsArray, 
  ValidateNested, 
  IsOptional, 
  ArrayMinSize, 
  IsString,
  Matches
} from 'class-validator';
import { Type } from 'class-transformer';



export class TimeSlotDto {

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Format should be : HH:mm (ej: 09:00)',
  })
  from: string;

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Format should be :  HH:mm (ej: 17:00)',
  })
  to: string;

}
export class AvailabilityDto {


  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  @ArrayMinSize(1)
  monday?: TimeSlotDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  @ArrayMinSize(1)
  tuesday?: TimeSlotDto[];


  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  @ArrayMinSize(1)
  wednesday?: TimeSlotDto[];

  
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  @ArrayMinSize(1)
  thursday?: TimeSlotDto[];


  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  @ArrayMinSize(1)
  friday?: TimeSlotDto[];


  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  @ArrayMinSize(1)
  saturday?: TimeSlotDto[];

 
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  @ArrayMinSize(1)
  sunday?: TimeSlotDto[];
}

