import { BadRequestException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { Request } from 'express';

interface ImageInterceptorOptions {
  maxFileSize?: number; 
  allowedFormats?: string[];
}

export function ImageUploadInterceptor(
  fieldName: string = 'images',
  maxCount: number = 5,
  options: ImageInterceptorOptions = {}
) {
  const {
    maxFileSize = 3,
    allowedFormats = ['jpg', 'jpeg', 'png', 'webp'],
  } = options;

  const maxSizeInBytes = maxFileSize * 1024 * 1024;
  const allowedMimeTypes: string[] = allowedFormats.map(format => {
    if (format === 'jpg') return 'image/jpeg';
    return `image/${format}`;
  });
  const allowedExtensions = allowedFormats.map(format => `.${format}`);

  return FilesInterceptor(fieldName, maxCount, {
    storage: memoryStorage(), 
    fileFilter: (req: Request, file: Express.Multer.File, callback) => {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return callback(
          new BadRequestException(
            `Tipo de archivo no permitido. Solo se aceptan: ${allowedExtensions.join(', ')}`
          ),
          false
        );
      }

      const ext = extname(file.originalname).toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        return callback(
          new BadRequestException(
            `Extension wrong. Extensions valid : ${allowedExtensions.join(', ')}`
          ),
          false
        );
      }

      callback(null, true);
    },
    limits: {
      fileSize: maxSizeInBytes,
      files: maxCount,
    },
  });
}