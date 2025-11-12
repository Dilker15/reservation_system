



import { Expose, Type } from 'class-transformer';


export class LocationResponseDto {
  
  @Expose()
  id: string;

  @Expose()
  latitude:number;


  @Expose()
  longitude: number;

}


