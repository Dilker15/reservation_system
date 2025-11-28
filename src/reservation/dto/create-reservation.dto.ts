import { Type } from "class-transformer";
import { IsDate, IsDateString, IsNumber, IsString, IsUUID, Matches, Max, Min } from "class-validator";



export class CreateReservationDto {

    private static readonly TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

    @IsDateString()
    date_reservation:string;


    @IsUUID()
    place_id:string;


    @IsString()
    @Matches(CreateReservationDto.TIME_REGEX, {
      message: 'start time must be in HH:mm format (00:00 - 23:59)',
    })
    start_time:string;



    @IsString()
    @Matches(CreateReservationDto.TIME_REGEX, {
        message: 'end time must be in HH:mm format (00:00 - 23:59)',
    })
    end_time:string;



    @IsNumber()
    @Type(()=>Number)
    quantity:number;


    @IsNumber()
    @Type(()=>Number)
    @Min(1)
    @Max(7)
    reservation_day:number






}
