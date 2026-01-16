import { UploadApiResponse } from "cloudinary";

export interface IImageUpload {
  uploadImages(filesPath:string[]): Promise<UploadApiResponse[]>;
  deleteImage(publicId: string): Promise<void>;
}