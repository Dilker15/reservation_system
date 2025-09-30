import { BookingMode } from "src/booking-mode/entities/booking-mode.entity";
import { DataSource } from "typeorm";
import { bookingModesData } from "../data/booking-mode.data";



export async function seedBookingMode(data:DataSource):Promise<void>{
    const repo =  data.getRepository(BookingMode);
    const elements = await repo.count();
    if(elements>0)return;

    for(const mode of bookingModesData){
       await repo.save({...mode});
    }
    console.log("seeder booking-mode created");
}