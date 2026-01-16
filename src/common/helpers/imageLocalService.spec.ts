import { promises as fs } from 'fs';
import { ImageLocalService } from './imageLocalService';
import { Express } from 'express';

jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn(),
    writeFile: jest.fn(),
    unlink: jest.fn(),
  },
}));

jest.mock('uuid', () => ({
  v4: () => 'mock-uuid',
}));

describe('ImageLocalService', () => {
  let service: ImageLocalService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ImageLocalService();
  });

  describe('saveImagesToDisk', () => {
    it('should create directory and save images to disk', async () => {
      const images: Express.Multer.File[] = [
        {
          fieldname: 'file',
          originalname: 'image1.png',
          encoding: '7bit',
          mimetype: 'image/png',
          size: 123,
          buffer: Buffer.from('buffer1'),
          destination: '',
          filename: '',
          path: '',
          stream: null as any,
        },
        {
          fieldname: 'file',
          originalname: 'image2.png',
          encoding: '7bit',
          mimetype: 'image/png',
          size: 456,
          buffer: Buffer.from('buffer2'),
          destination: '',
          filename: '',
          path: '',
          stream: null as any,
        },
      ];

      const result = await service.saveImagesToDisk(images);

      expect(fs.mkdir).toHaveBeenCalledWith(
        expect.stringContaining('uploads'),
        { recursive: true },
      );

      expect(fs.writeFile).toHaveBeenCalledTimes(images.length);
      expect(result).toHaveLength(images.length);

      result.forEach(filename => {
        expect(filename).toContain('mock-uuid');
      });
    });
  });

  describe('removeImageDisk', () => {
    it('should delete all images', async () => {
      const images = ['image1.png', 'image2.png'];

      await service.removeImageDisk(images);

      expect(fs.unlink).toHaveBeenCalledTimes(images.length);
    });

    it('should log error when image does not exist (ENOENT)', async () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      (fs.unlink as jest.Mock).mockRejectedValue({ code: 'ENOENT' });

      const images = ['image1.png'];

      await service.removeImageDisk(images);

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
