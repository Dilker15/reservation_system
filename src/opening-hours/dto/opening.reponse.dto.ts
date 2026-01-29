import { Expose } from "class-transformer";


export class OpeningHoursResponseDto{


    @Expose()
    id:string;


    @Expose()
    day:number;


    @Expose()
    open_time:string;


    @Expose()
    close_time:string;


    @Expose()
    is_active:boolean;

    
}