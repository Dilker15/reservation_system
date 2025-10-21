import { Processor, WorkerHost } from "@nestjs/bullmq";
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
        try {
            const imagesUploaded = await this.uploadImageServices.uploadImages(job.data.imagesRoutes);
            await Promise.all([
            this.imageLocal.removeImageDisk(job.data.imagesRoutes),
            this.placeService.addImagesPlace(job.data.place_id, imagesUploaded),
            ]);
            this.logger.log("images processed successfully");
        }catch (error) {
            this.logger.error("images processed failed ", error.stack || 'trace not found');
            throw error; 
        }
    }






}