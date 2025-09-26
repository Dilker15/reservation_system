import { IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { BookingName,BookingModeType } from "src/common/Interfaces";

export class CreateBookingModeDto {
    
  @IsEnum(BookingName, { message: 'Booking name is not correct' })
  name: BookingName;   

  @IsEnum(BookingModeType, { message: 'Mode is not correct' })
  type: BookingModeType;

  @IsOptional()
  @IsString()
  description: string;

  @IsNumber()
  @Min(1, { message: 'Minumun duration is wrong , value has to be greter than 0' })
  min_duration: number;
}
