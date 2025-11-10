import { Type } from "class-transformer";
import { IsNumber, IsOptional } from "class-validator";


export class UpdateLocationDto{



    @IsOptional()
    @Type(()=>Number)
    @IsNumber()
    latitude:number;


    @IsOptional()
    @Type(()=>Number)
    @IsNumber()
    longitude:number;
}