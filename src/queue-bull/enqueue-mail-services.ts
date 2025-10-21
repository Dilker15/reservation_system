import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { Queue } from "bullmq";
import { EMAIL_TYPE } from "src/common/Interfaces";
import { AppLoggerService } from "src/logger/logger.service";


@Injectable()
export class EnqueueMailServices{

    private logger:AppLoggerService;
    constructor(@InjectQueue('emails-queue')private readonly queueEmail:Queue,
                private readonly appLogServ:AppLoggerService, 
  ){
        this.logger = this.appLogServ.withContext(EnqueueMailServices.name);
    }


    async enqueEmail(notification_type:EMAIL_TYPE,data:any){
      try{
        await this.queueEmail.add(notification_type,{notification_type,data});
        this.logger.log("Notification email enqueue successfully : " + JSON.stringify(data));
      }catch(error){
         this.logger.log("Notification email enqueue failed : " + JSON.stringify(data,error.stack || "stack trace not found"));
        throw error;
      }
        
    }


}