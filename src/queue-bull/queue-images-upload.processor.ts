import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { ImageLocalService } from "src/common/helpers/imageLocalService";
import { ImageUploadService } from "src/image-upload/image-upload.service";
import { PlacesService } from "src/places/places.service";





@Processor('imageupload-queue')
export class ImageUploadProcessor extends WorkerHost{

    constructor(private readonly uploadImageServices:ImageUploadService,private readonly imageLocal:ImageLocalService,private readonly placeService:PlacesService){
        super();
    }


    async process(job: Job, token?: string): Promise<any> {
        try {
            const imagesUploaded = await this.uploadImageServices.uploadImages(job.data.imagesRoutes);
            await Promise.all([
            this.imageLocal.removeImageDisk(job.data.imagesRoutes),
            this.placeService.addImagesPlace(job.data.place_id, imagesUploaded),
            ]);
        }catch (error) {
            console.error('Error imageupload-queue:', error);
            throw error; 
        }
    }






}