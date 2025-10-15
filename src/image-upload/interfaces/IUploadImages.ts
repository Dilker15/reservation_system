import { UploadApiResponse } from "cloudinary";

export interface IImageUpload {
  uploadImages(filesPath:string[]): Promise<UploadApiResponse[]>;
  deleteImage(publicId: string): Promise<void>;
  getImagesByPlace(placeId: string): Promise<void>;
  getImageById(id: string): Promise<void>;
}