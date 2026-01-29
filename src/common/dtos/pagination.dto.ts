import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsPositive, IsUUID, Max, Min } from "class-validator";



export class PaginationDto{

    

    @Type(()=>Number)
    @IsNumber()
    @IsPositive()
    @Max(50,{message:'limit should less or equal than 50'})
    @IsOptional()
    limit?:number;



    @Type(()=>Number)
    @IsNumber()
    @IsPositive()
    @IsOptional()
    page?:number;



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