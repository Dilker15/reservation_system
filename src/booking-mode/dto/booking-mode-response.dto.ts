import { Expose } from "class-transformer";


export class BookingModeResponseDto{
    @Expose()
    id: string;
  
    @Expose()
    name: string;
  
    @Expose()
    type: string;
  
    @Expose()
    description?: string;
  
    @Expose()
    min_duration: number;
  
}