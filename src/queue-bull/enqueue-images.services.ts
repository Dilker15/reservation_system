import { InjectQueue } from "@nestjs/bullmq";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { Queue } from "bullmq";
import { EMAIL_TYPE, JobNameImages} from "src/common/Interfaces";
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
        await this.queueImages.add(JobNameImages.UPLOADIMAGES,{place_id,imagesRoutes});
        this.logger.log("Enque Image to process succesfully placeId: " +place_id);
      }catch(error){
        this.logger.error("Enque Image to process failed  place_id: " + place_id,error.stack || 'trace not found');
        throw error;
      } 
    }



    async enqueImageToRemove(place_id:string,imagesRoutesToUpdate:string[]){
       try{
           await this.queueImages.add(JobNameImages.DELETEIMAGES,{images:imagesRoutesToUpdate,place:place_id});
           this.logger.log("Enque Image to remove succesfully placeId : "+place_id);

       }catch(error){
          this.logger.error("Error enqueue image to update "+JSON.stringify(imagesRoutesToUpdate),error.stack);
          throw error;
       }
    }


}