import { Injectable, NotImplementedException } from "@nestjs/common";
import { promises as fs } from 'fs';
import { Multer } from "multer";
import path, { join } from 'path';


@Injectable()
export class ImageLocalService{

    private readonly pathImages:string = join(process.cwd(), 'uploads', 'images','places');
    
    async saveImagesToDisk(images: Express.Multer.File[]): Promise<string[]> {
          
          await fs.mkdir(this.pathImages, { recursive: true });
          
          const savedPaths: string[] = [];
          
          for (const image of images) {
            const filename:string = `${Date.now()}-${image.originalname}`;
            const filepath = join(this.pathImages, filename);
            await fs.writeFile(filepath, image.buffer);
            savedPaths.push(filename);
          }
          return savedPaths;
    }


    async removeImageDisk(imagesLocalPath: string[]): Promise<void> {
    const deleteTasks = imagesLocalPath.map(async (imgPath) => {
      try {
        console.log(imgPath);
        await fs.unlink(this.pathImages+'/'+imgPath);
      } catch (err) {
        if (err.code === 'ENOENT') {
          console.log("imagen no encontrada");
        } else {
         console.log("error al eliminar");
        }
      }
    });

    await Promise.all(deleteTasks);
  }
    
}