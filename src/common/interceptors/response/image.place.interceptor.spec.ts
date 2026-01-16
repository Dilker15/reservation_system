import { BadRequestException } from '@nestjs/common';
import { ImageUploadInterceptor } from './images.place.interceptor';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';

jest.mock('@nestjs/platform-express', () => ({
  FilesInterceptor: jest.fn(),
}));

describe('ImageUploadInterceptor', () => {
  const mockFilesInterceptor = FilesInterceptor as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should configure FilesInterceptor with default values', () => {
    ImageUploadInterceptor();

    expect(mockFilesInterceptor).toHaveBeenCalledTimes(1);

    const [, maxCount, options] = mockFilesInterceptor.mock.calls[0];

    expect(maxCount).toBe(5);
    expect(options.limits.fileSize).toBe(3 * 1024 * 1024);
    expect(options.limits.files).toBe(5);
    expect(options.storage).toBeDefined();
    expect(typeof options.fileFilter).toBe('function');
  });

  it('should allow valid image file', () => {
    ImageUploadInterceptor();

    const [, , options] = mockFilesInterceptor.mock.calls[0];
    const fileFilter = options.fileFilter;

    const file = {
      mimetype: 'image/png',
      originalname: 'photo.png',
    } as Express.Multer.File;

    const callback = jest.fn();

    fileFilter({} as Request, file, callback);

    expect(callback).toHaveBeenCalledWith(null, true);
  });

  it('should reject invalid mimetype', () => {
    ImageUploadInterceptor();

    const [, , options] = mockFilesInterceptor.mock.calls[0];
    const fileFilter = options.fileFilter;

    const file = {
      mimetype: 'application/pdf',
      originalname: 'file.pdf',
    } as Express.Multer.File;

    const callback = jest.fn();

    fileFilter({} as Request, file, callback);

    expect(callback).toHaveBeenCalledWith(
      expect.any(BadRequestException),
      false
    );
  });

  it('should reject invalid extension', () => {
    ImageUploadInterceptor();

    const [, , options] = mockFilesInterceptor.mock.calls[0];
    const fileFilter = options.fileFilter;

    const file = {
      mimetype: 'image/png',
      originalname: 'file.exe',
    } as Express.Multer.File;

    const callback = jest.fn();

    fileFilter({} as Request, file, callback);

    expect(callback).toHaveBeenCalledWith(
      expect.any(BadRequestException),
      false
    );
  });

  it('should use custom maxFileSize and allowedFormats', () => {
    ImageUploadInterceptor('images', 2, {
      maxFileSize: 10,
      allowedFormats: ['webp'],
    });

    const [, maxCount, options] = mockFilesInterceptor.mock.calls[0];

    expect(maxCount).toBe(2);
    expect(options.limits.fileSize).toBe(10 * 1024 * 1024);

    const fileFilter = options.fileFilter;
    const callback = jest.fn();

    const validFile = {
      mimetype: 'image/webp',
      originalname: 'image.webp',
    } as Express.Multer.File;

    fileFilter({} as Request, validFile, callback);

    expect(callback).toHaveBeenCalledWith(null, true);
  });

  it('should reject jpg if not included in allowedFormats', () => {
    ImageUploadInterceptor('images', 5, {
      allowedFormats: ['png'],
    });

    const [, , options] = mockFilesInterceptor.mock.calls[0];
    const fileFilter = options.fileFilter;

    const file = {
      mimetype: 'image/jpeg',
      originalname: 'photo.jpg',
    } as Express.Multer.File;

    const callback = jest.fn();

    fileFilter({} as Request, file, callback);

    expect(callback).toHaveBeenCalledWith(
      expect.any(BadRequestException),
      false
    );
  });
});
