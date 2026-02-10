import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID, Min } from "class-validator";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { placeEnumStatus } from "../interfaces/interfaces";




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


export class PlaceOwnerQueryDto extends PaginationDto{

    @IsOptional()
    @IsEnum(placeEnumStatus,{message:`status must be a valid placeEnumStatus value`})
    status?:placeEnumStatus;


    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name?:string;
}