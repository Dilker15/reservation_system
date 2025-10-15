import { Injectable, NotImplementedException } from "@nestjs/common";
import { promises as fs } from 'fs';
import { Multer } from "multer";
import { join } from 'path';


@Injectable()
export class ImageLocalService{
    
    async saveImagesToDisk(images: Express.Multer.File[]): Promise<string[]> {
          const uploadPath = join(process.cwd(), 'uploads', 'images','places');
          
          await fs.mkdir(uploadPath, { recursive: true });
          
          const savedPaths: string[] = [];
          
          for (const image of images) {
            const filename:string = `${Date.now()}-${image.originalname}`;
            const filepath = join(uploadPath, filename);
            await fs.writeFile(filepath, image.buffer);
            savedPaths.push(filename);
          }
          
          return savedPaths;
    
    }


    async removeImageDisk(images:string[]):Promise<void>{
        throw new NotImplementedException("Not implemented yet")
    }
    
}