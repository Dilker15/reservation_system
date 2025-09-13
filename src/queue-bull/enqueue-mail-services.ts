import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { Queue } from "bullmq";
import { EMAIL_TYPE } from "src/common/Interfaces";


@Injectable()
export class EnqueueMailServices{


    constructor(@InjectQueue('emails-queue')private readonly queueEmail:Queue){

    }


    async enqueEmail(notification_type:EMAIL_TYPE,data:any){
      try{
        await this.queueEmail.add(notification_type,{notification_type,data});
      }catch(error){
        throw error;
      }
        
    }


}