import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { Queue } from "bullmq";
import { EMAIL_TYPE } from "src/common/Interfaces";


@Injectable()
export class EnqueueImagesUploadServices{


    constructor(@InjectQueue('imageupload-queue')private readonly queueImages:Queue){

    }


    async enqueImagesToUpload(place_id:string,imagesRoutes:string[]){
      try{
        await this.queueImages.add('upload-images-cloud',{place_id,imagesRoutes});
      }catch(error){
        console.log(error);
        throw error;
      }
        
    }


}