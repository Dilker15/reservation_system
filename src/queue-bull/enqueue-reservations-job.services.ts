import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { Queue } from "bullmq";
import { JobNameSchedule } from "src/common/Interfaces";
import { AppLoggerService } from "src/logger/logger.service";



@Injectable()
export class EnqueueReservationsJobService{


    private logger:AppLoggerService;

    constructor(@InjectQueue('reservations.expiration') private readonly queueReservations:Queue,
                private readonly appLogServ : AppLoggerService,
    ){
        this.logger = this.appLogServ.withContext(EnqueueReservationsJobService.name);
    }



    async enqueScheduleExpiration(reservation_id:string){
        try{
            await this.queueReservations.add(JobNameSchedule.EXPIRERESERVATION,{reservation_id},{delay:1000 * 60 * 10 });
            this.logger.log("Enque Reservations Schedule  to process succesfully reservation_id: " + reservation_id);
        }catch(error){
            this.logger.error(`error enque reservations schedule  reservation id : ${reservation_id}`,error.stack  || 'trace not found');
            throw error;
        }
    }



}