import { Processor, WorkerHost } from "@nestjs/bullmq";
import { InternalServerErrorException } from "@nestjs/common";
import { Job } from "bullmq";
import { ImageLocalService } from "src/common/helpers/imageLocalService";
import { ImageUploadService } from "src/image-upload/image-upload.service";
import { AppLoggerService } from "src/logger/logger.service";
import { PlacesService } from "src/places/places.service";





@Processor('imageupload-queue')
export class ImageUploadProcessor extends WorkerHost{

    private logger:AppLoggerService;

    constructor(private readonly uploadImageServices:ImageUploadService,private readonly imageLocal:ImageLocalService,
        private readonly placeService:PlacesService,
        private readonly appLogServ:AppLoggerService
    ){
        super();
        this.logger = this.appLogServ.withContext(ImageUploadProcessor.name);
    }


    async process(job: Job, token?: string): Promise<any> {
            switch(job.name){
                case 'upload-images-cloud':{
                    this.uploadImages(job);
                    break;
                }
                case 'delete-images-cloud':{
                    this.deleteImages(job);
                    break;
                }
            }
    }



    private async uploadImages(job:Job){
        try{
            const imagesUploaded = await this.uploadImageServices.uploadImages(job.data.imagesRoutes);
            await Promise.all([
            this.imageLocal.removeImageDisk(job.data.imagesRoutes),
            this.placeService.addImagesPlace(job.data.place_id, imagesUploaded)]);
            this.logger.log("images uploaded and place updated successfully");
        }catch(error){
            this.logger.error("Error to store images - cloud",error.stack || 'error found trace on uploadImages Cloud')
             throw new InternalServerErrorException("Error to store images");
        }
        
    }


    private async deleteImages(job:Job){
        const {place,images} = job.data;
        console.log("DELETE METHOD-------------------------------------")
        console.log(place);
        console.log(images);
        console.log("DELETE METHOD-------------------------------------")
    }





}