import { Expose } from "class-transformer";


export class CountryResponseDto{

    @Expose()
    id:string;

    @Expose()
    name:string;

    @Expose()
    country_code:string;
}