import { AppLoggerService } from "src/logger/logger.service";
import { ImageUploadProcessor } from "./queue-images-upload.processor";
import { ImageUploadService } from "src/image-upload/image-upload.service";
import { ImageLocalService } from "src/common/helpers/imageLocalService";
import { PlacesService } from "src/places/places.service";
import { Test, TestingModule } from "@nestjs/testing";
import { Job } from "bullmq";


jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));




describe("QueueImageUploadProcessor",()=>{
    let processor:ImageUploadProcessor;
    let mockImageUploadService:Partial<ImageUploadService>;
    let mockImageLocal:Partial<ImageLocalService>;
    let mockLoggerContext:Partial<AppLoggerService>;
    let mockPlaceService:Partial<PlacesService>;

    let mockLogger = {
        error:jest.fn(),
        log:jest.fn(),
    }

    const mockImageUploadedData = ['https://www.img1.cloud','https://www.img2.cloud'];

    beforeEach(async()=>{
        mockImageLocal = {
            removeImageDisk:jest.fn(),
            saveImagesToDisk:jest.fn(),    
        }

        mockImageUploadService = {
            uploadImages:jest.fn().mockResolvedValue(mockImageUploadedData),
        }
        
        mockPlaceService = {
            addImagesPlace:jest.fn(),
            updateImagesPlace:jest.fn(),
        }

        mockLoggerContext = {
            withContext: jest.fn().mockReturnValue(mockLogger)
        };


        const refService:TestingModule = await Test.createTestingModule({
            providers:[
                ImageUploadProcessor,
                {
                    provide:ImageUploadService,
                    useValue:mockImageUploadService
                },
                {
                    provide:PlacesService,
                    useValue:mockPlaceService,
                },
                {
                    provide:ImageLocalService,
                    useValue:mockImageLocal
                },
                {
                    provide:AppLoggerService,
                    useValue:mockLoggerContext,
                }
            ]
        }).compile();

        processor = refService.get<ImageUploadProcessor>(ImageUploadProcessor);

    });

    afterEach(()=>{
        jest.clearAllMocks();
    });

    it("should be defined",()=>{
        expect(processor).toBeDefined();
    });


    it("should uploadImages cloud with correct data",async()=>{
        const place_id = 'place_id_1';
        const imagesRoutes:string[] = ['route/image1.jpg','route/image2.png'];
        const job = {
             name:'upload-images-cloud',
             data:{
                place_id,
                imagesRoutes
             }
        } as any as Job;
        
        await processor.process(job);
        expect(mockImageUploadService.uploadImages).toHaveBeenCalledWith(imagesRoutes);
        expect(mockImageLocal.removeImageDisk).toHaveBeenCalledWith(imagesRoutes);
        expect(mockPlaceService.addImagesPlace).toHaveBeenCalledWith(place_id,mockImageUploadedData)
        expect(mockLogger.log).toHaveBeenCalledTimes(1);
    });


    it("should log error upload imageCloud",async()=>{
        const place_id = 'place_id_1';
        const imagesRoutes:string[] = ['route/image1.jpg','route/image2.png'];
        const job = {
             name:'upload-images-cloud',
             data:{
                place_id,
                imagesRoutes
             }
        } as any as Job;
        (mockImageUploadService.uploadImages as jest.Mock).mockRejectedValueOnce(new Error);
        await processor.process(job);
        expect(mockLogger.error).toHaveBeenCalledTimes(1);
    });


    it("should updateImage correct",async()=>{
        const place = 'place_id_1';
        const images:string[] = ['route/image1.jpg','route/image2.png'];
        const job = {
             name:'update-images-cloud',
             data:{
                place,
                images
                
             }
        } as any as Job;
        await processor.process(job);
        expect(mockImageUploadService.uploadImages).toHaveBeenCalledWith(images);
        expect(mockPlaceService.updateImagesPlace).toHaveBeenCalledWith(place,mockImageUploadedData);
        expect(mockImageLocal.removeImageDisk).toHaveBeenCalledWith(images);
        expect(mockLogger.log).toHaveBeenCalledTimes(2);
    });
    

   
    it("should log error updateImages",async()=>{
        const place = 'place_id_1';
        const images:string[] = ['route/image1.jpg','route/image2.png'];
        const job = {
             name:'update-images-cloud',
             data:{
                place,
                images
             }
        } as any as Job;

       (mockImageUploadService.uploadImages as jest.Mock).mockRejectedValueOnce(new Error());
       await processor.process(job);
       expect(mockLogger.error).toHaveBeenCalled();
       expect(mockLogger.log).toHaveBeenCalled();
       expect(mockImageLocal.removeImageDisk).toHaveBeenCalledWith(images);



    });

    


});