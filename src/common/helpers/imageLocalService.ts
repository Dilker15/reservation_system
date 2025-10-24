import { Injectable, NotImplementedException } from "@nestjs/common";
import { promises as fs } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ImageLocalService{

    private readonly pathImages:string = join(process.cwd(), 'uploads', 'images','places');
    
    async saveImagesToDisk(images: Express.Multer.File[]): Promise<string[]> {
          try{
            await fs.mkdir(this.pathImages, { recursive: true });
            const savedPaths: string[] = [];
          
          for (const image of images) {
            const filename:string = `${uuidv4()}-${image.originalname}`;
            const filepath = join(this.pathImages, filename);
            await fs.writeFile(filepath, image.buffer);
            savedPaths.push(filename);
          }
           return savedPaths;
          }catch(error){
            throw error;
          }
    }


    async removeImageDisk(imagesLocalPath: string[]): Promise<void> {
    const deleteTasks = imagesLocalPath.map(async (imgPath) => {
      try {
        await fs.unlink(this.pathImages+'/'+imgPath);
      } catch (err) {
        if (err.code === 'ENOENT') {
          console.error("imagen no encontrada");
        } else {
         console.error("error al eliminar");
        }
      }
    });

    await Promise.all(deleteTasks);
  }
    
}