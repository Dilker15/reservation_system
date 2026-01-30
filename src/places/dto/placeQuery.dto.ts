import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsPositive, IsUUID, Min } from "class-validator";
import { PaginationDto } from "src/common/dtos/pagination.dto";




export class PlaceQueryDto extends PaginationDto{

    @IsUUID()
    @IsOptional()
    category?:string;


    @IsUUID()
    @IsOptional()
    city?:string;


    @IsUUID()
    @IsOptional()
    reservation_mode?:string;



    @Type(()=>Number)
    @IsNumber()
    @Min(1,{message:'min price should be greater than zero'})
    @IsOptional()
    min_price?:number;


    @Type(()=>Number)
    @IsNumber()
    @IsPositive()
    @IsOptional()
    max_price?:number;

}