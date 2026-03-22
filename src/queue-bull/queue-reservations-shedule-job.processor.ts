import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { JobNameSchedule } from "src/common/Interfaces";
import { AppLoggerService } from "src/logger/logger.service";
import { ReservationService } from "src/reservation/reservation.service";





@Processor('reservations.expiration')
export class ReservationsScheduleProcessor extends WorkerHost{

     private logger:AppLoggerService;

    constructor(private readonly reservationService:ReservationService,private readonly appLogService:AppLoggerService){
        super();
        this.logger = appLogService.withContext(ReservationsScheduleProcessor.name);
    }

    async process(job: Job): Promise<void> {
        try {
          switch (job.name) {
      
            case JobNameSchedule.EXPIRERESERVATION : {
              const { reservation_id } = job.data;
              if (!reservation_id) {
                throw new Error('reservation_id is required');
              }
              await this.reservationService.expireReservation(reservation_id);
              this.logger.log("reservations expired succesfully : " + reservation_id);
              break;
            }
            default:
              this.logger.warn(`Unknown job: ${job.name}`);
          }
      
        } catch (error) {
          this.logger.error(`Error processing job ${job.name}`, error);
          throw error; 
        }
      }



}