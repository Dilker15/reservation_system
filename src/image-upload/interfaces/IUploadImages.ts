
export interface IImageUpload {
  uploadImages(files: Express.Multer.File[]): Promise<void>;
  deleteImage(publicId: string): Promise<void>;
  getImagesByPlace(placeId: string): Promise<void>;
  getImageById(id: string): Promise<void>;
}