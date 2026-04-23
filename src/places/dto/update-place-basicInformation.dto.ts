import { IsNumber, IsString, Min, MinLength, IsOptional } from "class-validator";

export class UpdateBasicInformationDto {

    @IsOptional()
    @IsString()
    @MinLength(3)
    name: string;

    @IsOptional()
    @IsString()
    description: string;

    @IsOptional()
    @IsString()
    address: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    price: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    max_guests: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    bedrooms: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    bathrooms: number;
}