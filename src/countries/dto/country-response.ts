import { Expose, Type } from "class-transformer";


export class CountryResponseDto{

    @Expose()
    id:string;

    @Expose()
    name:string;

    @Expose()
    country_code:string;
}


export class CityResponseDto{

    @Expose()
    id:string;

    @Expose()
    name:string;


    @Expose()
    @Type(()=>CountryResponseDto)
    country:CountryResponseDto;

}