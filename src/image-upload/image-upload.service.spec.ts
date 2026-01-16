import { PlaceImages } from "src/places/entities/place-images.entity";
import { Repository } from "typeorm/browser";
import {v2 as Cloudinary, UploadApiResponse} from 'cloudinary';
import { Test, TestingModule } from "@nestjs/testing";
import { ImageUploadService } from "./image-upload.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { AppLoggerService } from "src/logger/logger.service";
import { BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { clear } from "console";

describe("src/image-upload/image-upload.service.ts",()=>{

    let mockImageRepo:Partial<jest.Mocked<Repository<PlaceImages>>>
    let mockLogger;
    let mockCloudinary;
    let uploadService:ImageUploadService;

    beforeEach(async()=>{
        jest.clearAllMocks();
        mockImageRepo = {
            findOne: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
        }
        mockLogger = {
            withContext: jest.fn().mockReturnThis(), 
            log: jest.fn(),
            error: jest.fn(),
        };
       mockCloudinary = {
            uploader: {
                upload: jest.fn().mockResolvedValue({
                    url: 'https://mockurl.com/image.jpg',
                    public_id: 'mockId',
                }),
                destroy: jest.fn().mockResolvedValue({ result: 'ok' }),
            },
        };

        const serviceRef:TestingModule = await Test.createTestingModule({
             providers:[
                ImageUploadService,
                {
                    provide:'CLOUDINARY',
                    useValue:mockCloudinary
                },
                {
                    provide:getRepositoryToken(PlaceImages),
                    useValue:mockImageRepo
                },
                {
                    provide:AppLoggerService,
                    useValue:mockLogger,
                }
             ]
        }).compile();
        uploadService = serviceRef.get<ImageUploadService>(ImageUploadService);

    });



    it("should upload and return images",async()=>{
        const imagesParam = ['route1.jpg','route2.jpg'];
        const result = await uploadService.uploadImages(imagesParam);
        expect(mockCloudinary.uploader.upload).toHaveBeenCalledTimes(imagesParam.length);
        expect(result).toHaveLength(imagesParam.length);
        expect(result[0]).toMatchObject({
            url: 'https://mockurl.com/image.jpg',
            public_id: 'mockId',
        });
    });



    it("should throw InternalServerErrorException when upload fails",async()=>{
         const imagesParam = ['route1.jpg','route2.jpg'];
         mockCloudinary.uploader.upload.mockRejectedValueOnce(new Error('fail'));
         await expect(uploadService.uploadImages(imagesParam)).rejects.toThrow(InternalServerErrorException);
        expect(mockLogger.error).toHaveBeenCalled();
    });



    it("should delete images from cloud",async()=>{
        const idToDelete = 'uuid-1';
        await uploadService.deleteImage(idToDelete);
        expect(mockCloudinary.uploader.destroy).toHaveBeenCalledWith(idToDelete);
        expect(mockLogger.log).toHaveBeenCalled();
    });

     it("should throw error when delete fails",async()=>{
        const idToDelete = 'uuid-1';
        mockCloudinary.uploader.destroy.mockRejectedValueOnce(new Error('fail delete image'));
        await expect(uploadService.deleteImage(idToDelete)).rejects.toThrow();
        expect(mockLogger.error).toHaveBeenCalled();
    });

    
});