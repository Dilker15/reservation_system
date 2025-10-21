import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { Queue } from "bullmq";
import { EMAIL_TYPE } from "src/common/Interfaces";
import { AppLoggerService } from "src/logger/logger.service";


@Injectable()
export class EnqueueImagesUploadServices{

    private logger:AppLoggerService;

    constructor(@InjectQueue('imageupload-queue')private readonly queueImages:Queue,
                private readonly appLogServ : AppLoggerService,
  ){
      this.logger = this.appLogServ.withContext(EnqueueImagesUploadServices.name)
    }


    async enqueImagesToUpload(place_id:string,imagesRoutes:string[]){
      try{
        await this.queueImages.add('upload-images-cloud',{place_id,imagesRoutes});
        this.logger.log("Enque Image to process succesfully placeId: " +place_id);
      }catch(error){
        this.logger.error("Enque Image to process failed  place_id: " + place_id,error.stack || 'trace not found');
        throw error;
      }
        
    }


}