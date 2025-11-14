import { Expose } from "class-transformer";


export class OpeningHoursResponseDto{


    @Expose()
    id:string;


    @Expose()
    day:number;

    
}