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


}