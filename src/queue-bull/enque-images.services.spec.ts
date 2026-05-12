import { Queue } from "bullmq";
import { EnqueueImagesUploadServices } from "./enqueue-images.services";
import { AppLoggerService } from "src/logger/logger.service";
import { Test, TestingModule } from "@nestjs/testing";
import { getQueueToken } from "@nestjs/bullmq";
import { JobNameImages } from "src/common/Interfaces";
import { BadRequestException } from "@nestjs/common";




describe("EnqueImageService",()=>{

    let enqueService:EnqueueImagesUploadServices;
    let mockLogger:Partial<AppLoggerService>;
    let mockQueueImages:Partial<jest.Mocked<Queue>>;

    let mockLoggerData = {
        log:jest.fn(),
        error:jest.fn(),
    }

    beforeEach(async()=>{
       mockLogger = {
         withContext:jest.fn().mockReturnValue(mockLoggerData),
       }
       mockQueueImages = {
         add:jest.fn()
       }

       const refService:TestingModule = await Test.createTestingModule({
            providers:[
                EnqueueImagesUploadServices,
                {
                    provide:AppLoggerService,
                    useValue:mockLogger,
                },
                {
                    provide:getQueueToken('imageupload-queue'),
                    useValue:mockQueueImages,
                }
            ]
       }).compile();

       enqueService = refService.get<EnqueueImagesUploadServices>(EnqueueImagesUploadServices);
    });


    afterEach(()=>{
        jest.clearAllMocks();
    });


    it("should enque image to queue with correc data",async()=>{
        const place_id:string = 'place-uuid';
        const imagesRoutes:string[] = ['route/image1.jpg','route/image2.png'];
        
        await enqueService.enqueImagesToUpload(place_id,imagesRoutes);

        expect(mockLoggerData.log).toHaveBeenCalledTimes(1);
        expect(mockQueueImages.add).toHaveBeenCalledWith(JobNameImages.UPLOADIMAGES,{place_id,imagesRoutes});
    });

    it("shoud thow Error enqueImagesToUpload",async()=>{
        const place_id:string='place-uuid';
        const imagesRoutes:string[] = ['route/image1.png','route/image2.jpg'];
        mockQueueImages.add?.mockRejectedValueOnce(new Error());
        await expect(enqueService.enqueImagesToUpload(place_id,imagesRoutes)).rejects.toThrow();
        expect(mockLoggerData.error).toHaveBeenCalledTimes(1);
    });


    it("should enqueImageToUpdate with correct data",async()=>{
        const place_id:string='place-uuid';
        const imagesRoutesToUpdate:string[]= ['route/image1.png','route/image2.jpg'];
        const owner_id:string ='owner-uuid';
        await enqueService.enqueImageToUpdate(place_id,imagesRoutesToUpdate,owner_id);
        expect(mockQueueImages.add).toHaveBeenCalledWith(JobNameImages.UPDATEIMAGES,{images:imagesRoutesToUpdate,place:place_id,owner:owner_id});
        expect(mockLoggerData.log).toHaveBeenCalledTimes(1);
    });



    it("should thow error enqueImageToUpdate",async()=>{
        const place_id:string='place-uuid';
        const imagesRoutesToUpdate:string[]= ['route/image1.png','route/image2.jpg'];
        const owner_id:string ='owner-uuid';
        mockQueueImages.add?.mockRejectedValueOnce(new Error());
        await expect(enqueService.enqueImageToUpdate(place_id,imagesRoutesToUpdate,owner_id)).rejects.toThrow();
        expect(mockLoggerData.error).toHaveBeenCalledTimes(1);
    });



});