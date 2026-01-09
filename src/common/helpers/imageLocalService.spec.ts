import { promises as fs } from 'fs';
import { ImageLocalService } from "./imageLocalService";
import { InternalServerErrorException } from '@nestjs/common';


jest.mock('fs', () => ({
    promises: {
        mkdir: jest.fn(),
        writeFile: jest.fn(),
        unlink:jest.fn(),
    },
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));


describe("src/common/helpers/imageLocalService.spect.ts",()=>{

    let imageLocalServi:ImageLocalService;
    interface imageType {
        originalName:string,
        buffer:any,
    }
    beforeEach(()=>{
        jest.clearAllMocks();
        imageLocalServi = new ImageLocalService();
    });



    it("should return imagesPath stored locally",async()=>{
         const images:imageType [] = [{buffer:'buffer1',originalName:'image1'},{buffer:"buffer2",originalName:'image2'}]
         const result = await imageLocalServi.saveImagesToDisk(images as []);
         expect(fs.mkdir).toHaveBeenCalledWith(expect.stringContaining('uploads'), { recursive: true });
         expect(fs.writeFile).toHaveBeenCalledTimes(images.length);

    });


    
    it("should return imagesPath stored locally",async()=>{
         const images:imageType [] = [{buffer:'buffer1',originalName:'image1'},{buffer:"buffer2",originalName:'image2'}]
         const result = await imageLocalServi.saveImagesToDisk(images as []);
         expect(fs.mkdir).toHaveBeenCalledWith(expect.stringContaining('uploads'), { recursive: true });
         expect(fs.writeFile).toHaveBeenCalledTimes(images.length);
    });




    it('should throw InternalServerErrorException if mkdir fails', async () => {
    (fs.mkdir as jest.Mock).mockRejectedValue(new InternalServerErrorException('mkdir failed'));

    const images: imageType[] = [
        { buffer: 'buffer1', originalName: 'image1' },
        { buffer: 'buffer2', originalName: 'image2' },
    ];

    await expect(imageLocalServi.saveImagesToDisk(images as any)).rejects
        .toThrow(InternalServerErrorException);
    });



    it("should detele all image locally",async()=>{
        const images = ["src/path/images1","src/path/image2","src/path/image3"];
        const result = await imageLocalServi.removeImageDisk(images);
        expect(fs.unlink).toHaveBeenCalledTimes(images.length);
    });


    it("should throw exception path not found",async()=>{
       const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
        (fs.unlink as jest.Mock).mockRejectedValue({
            code:'ENOENT',
        });
        const images = ["src/path/images1","src/path/image2","src/path/image3"];
        await imageLocalServi.removeImageDisk(images);
        expect(fs.unlink).toHaveBeenCalledTimes(images.length);
        expect(spy).toHaveBeenCalledTimes(images.length);
    });

    it("should throw error on delete image",async()=>{
       const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
        (fs.unlink as jest.Mock).mockRejectedValue({
            code:'NFT',
        });
        const images = ["src/path/images1","src/path/image2","src/path/image3"];
        await imageLocalServi.removeImageDisk(images);
        expect(fs.unlink).toHaveBeenCalledTimes(images.length);
        expect(spy).toHaveBeenCalledTimes(images.length);
    });

    

});