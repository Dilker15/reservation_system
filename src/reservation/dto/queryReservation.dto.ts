import { IsEnum, IsOptional } from "class-validator"
import { PaginationDto } from "src/common/dtos/pagination.dto"
import { RESERVATION_STATUS } from "src/common/Interfaces";
import { IsDateOnly } from "src/common/validators/onlydate.validator"



export class QueryReservationDto extends PaginationDto{


    @IsOptional()
    @IsDateOnly()
    from?:string;



    @IsOptional()
    @IsDateOnly()
    to?:string;



    @IsOptional()
    @IsEnum(RESERVATION_STATUS)
    status?:RESERVATION_STATUS;

}