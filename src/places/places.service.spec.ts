import { Test, TestingModule } from '@nestjs/testing';
import { PlacesService } from './places.service';
import { DataSource, Repository } from 'typeorm';
import { Place } from './entities/place.entity';
import { PlaceImages } from './entities/place-images.entity';
import { Category } from 'src/categories/entities/category.entity';
import { BookingMode } from 'src/booking-mode/entities/booking-mode.entity';
import { City } from 'src/countries/entities/city.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { placeEnumStatus } from './interfaces/interfaces';
import { EnqueueImagesUploadServices } from 'src/queue-bull/enqueue-images.services';
import { AppLoggerService } from 'src/logger/logger.service';
import { LocationsService } from 'src/locations/locations.service';
import { ImageUploadService } from 'src/image-upload/image-upload.service';

describe('PlacesService - Business Logic Tests', () => {
  let service: PlacesService;
  let placeRepo: jest.Mocked<Repository<Place>>;
  let placeImageRepo: jest.Mocked<Repository<PlaceImages>>;
  let categoryRepo: jest.Mocked<Repository<Category>>;
  let bookingRepo: jest.Mocked<Repository<BookingMode>>;
  let cityRepo: jest.Mocked<Repository<City>>;

 
  const createMockUser = (id = 'user-1'): User => ({
    id,
    email: 'test@test.com',
  } as User);

  const createMockPlace = (overrides = {}): Place => ({
    id: 'place-1',
    name: 'Test Place',
    description: 'Test description',
    price: 100,
    status: placeEnumStatus.ACTIVE,
    images: [],
    owner: createMockUser(),
    category: { id: 'cat-1', name: 'Category' } as Category,
    booking_mode: { id: 'book-1', name: 'Instant' } as BookingMode,
    city: { id: 'city-1', name: 'Test City' } as City,
    location: { latitude: 10, longitude: 20 },
    opening_hours: [],
    ...overrides,
  } as any as Place);

  const createMockCategory = (): Category => ({
    id: 'cat-1',
    name: 'Test Category',
    is_active: true,
  } as Category);

  const createMockBookingMode = (): BookingMode => ({
    id: 'book-1',
    name: 'Instant Booking',
    is_active: true,
  } as BookingMode);

  const createMockCity = (): City => ({
    id: 'city-1',
    name: 'Test City',
    is_active: true,
  } as City);

  beforeEach(async () => {
    const mockPlaceRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      findOneOrFail: jest.fn(),
      update: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const mockPlaceImageRepo = {
      findOne: jest.fn(),
      remove: jest.fn(),
    };

    const mockCategoryRepo = {
      findOneBy: jest.fn(),
    };

    const mockBookingRepo = {
      findOneBy: jest.fn(),
    };

    const mockCityRepo = {
      findOneBy: jest.fn(),
      findOneByOrFail: jest.fn(),
    };

    const mockEnqueueService = {
      enqueImagesToUpload: jest.fn(),
      enqueImageToUpdate: jest.fn(),
    };

    const mockLogger = {
      withContext: jest.fn().mockReturnValue({
        log: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
      }),
    };

    const mockLocationService = {
      updateByPlace: jest.fn(),
    };

    const mockImageUploadService = {
      deleteImage: jest.fn(),
    };

    const mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue({
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        manager: {
          getRepository: jest.fn(),
        },
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlacesService,
        { provide: getRepositoryToken(Place), useValue: mockPlaceRepo },
        { provide: getRepositoryToken(PlaceImages), useValue: mockPlaceImageRepo },
        { provide: getRepositoryToken(Category), useValue: mockCategoryRepo },
        { provide: getRepositoryToken(BookingMode), useValue: mockBookingRepo },
        { provide: getRepositoryToken(City), useValue: mockCityRepo },
        { provide: EnqueueImagesUploadServices, useValue: mockEnqueueService },
        { provide: DataSource, useValue: mockDataSource },
        { provide: AppLoggerService, useValue: mockLogger },
        { provide: LocationsService, useValue: mockLocationService },
        { provide: ImageUploadService, useValue: mockImageUploadService },
      ],
    }).compile();

    service = module.get<PlacesService>(PlacesService);
    placeRepo = module.get(getRepositoryToken(Place));
    placeImageRepo = module.get(getRepositoryToken(PlaceImages));
    categoryRepo = module.get(getRepositoryToken(Category));
    bookingRepo = module.get(getRepositoryToken(BookingMode));
    cityRepo = module.get(getRepositoryToken(City));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('should return a place when found', async () => {
      const mockPlace = createMockPlace();
      placeRepo.findOne.mockResolvedValue(mockPlace);

      const result = await service.findOne('place-1');

      expect(result).toBeDefined();
      expect(result.id).toBe('place-1');
    });

    it('should throw BadRequestException when place not found', async () => {
      placeRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        BadRequestException
      );
    });

    it('should filter by owner when provided', async () => {
      const owner = createMockUser();
      const mockPlace = createMockPlace({ owner });
      placeRepo.findOne.mockResolvedValue(mockPlace);

      await service.findOne('place-1', owner);

      expect(placeRepo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            owner: { id: owner.id },
          }),
        })
      );
    });

    it('should only return active places', async () => {
      const mockPlace = createMockPlace();
      placeRepo.findOne.mockResolvedValue(mockPlace);

      await service.findOne('place-1');

      expect(placeRepo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: placeEnumStatus.ACTIVE,
          }),
        })
      );
    });

    it('should throw InternalServerErrorException on unexpected errors', async () => {
      placeRepo.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.findOne('place-1')).rejects.toThrow(
        InternalServerErrorException
      );
    });
  });

  describe('getMyPlaces', () => {
    it('should return all active places for owner', async () => {
      const owner = createMockUser();
      const mockPlaces = [
        createMockPlace({ owner }),
        createMockPlace({ id: 'place-2', owner }),
      ];
      placeRepo.find.mockResolvedValue(mockPlaces);

      const result = await service.getMyPlaces(owner);

      expect(result).toHaveLength(2);
      expect(placeRepo.find).toHaveBeenCalledWith({
        where: {
          owner: { id: owner.id },
          status: placeEnumStatus.ACTIVE,
        },
      });
    });

    it('should return empty array when owner has no places', async () => {
      const owner = createMockUser();
      placeRepo.find.mockResolvedValue([]);

      const result = await service.getMyPlaces(owner);

      expect(result).toEqual([]);
    });
  });

  describe('updateImages - Business Validation', () => {
    it('should reject when total images exceed 5', async () => {
      const owner = createMockUser();
      const placeWith4Images = createMockPlace({
        images: [
          { id: '1' } as PlaceImages,
          { id: '2' } as PlaceImages,
          { id: '3' } as PlaceImages,
          { id: '4' } as PlaceImages,
        ],
      });

      placeRepo.findOne.mockResolvedValue(placeWith4Images);

      await expect(
        service.updateImages('place-1', owner, ['file1.jpg', 'file2.jpg'])
      ).rejects.toThrow('Max number of total files accepted 5,remove files');
    });

    it('should allow update when total stays at or below 5', async () => {
      const owner = createMockUser();
      const placeWith3Images = createMockPlace({
        images: [
          { id: '1' } as PlaceImages,
          { id: '2' } as PlaceImages,
          { id: '3' } as PlaceImages,
        ],
      });

      placeRepo.findOne.mockResolvedValue(placeWith3Images);

      const result = await service.updateImages('place-1', owner, ['file1.jpg']);

      expect(result?.message).toContain('images will be updated');
    });
  });

  describe('updateCategory - Business Rules', () => {
    it('should throw when category not found', async () => {

      const owner = createMockUser();
      categoryRepo.findOneBy.mockResolvedValue(null);

      await expect(service.updateCategory('place1','cat1',owner)).rejects.toThrow(BadRequestException)
    });

    it('should throw when category is inactive', async () => {
      const owner = createMockUser();
      const inactiveCategory = { ...createMockCategory(), is_active: false };
      categoryRepo.findOneBy.mockResolvedValue(inactiveCategory);

      await expect(
        service.updateCategory('place-1', 'cat-1', owner)
      ).rejects.toThrow(BadRequestException);
    });

    it('should update category when valid and active', async () => {
      const owner = createMockUser();
      const validCategory = createMockCategory();
      const existingPlace = createMockPlace();

      categoryRepo.findOneBy.mockResolvedValue(validCategory);
      placeRepo.findOne.mockResolvedValue(existingPlace);
      placeRepo.update.mockResolvedValue({ affected: 1 } as any);

      const result = await service.updateCategory('place-1', 'cat-1', owner);

      expect(result).toBeDefined();
      expect(placeRepo.update).toHaveBeenCalledWith(
        'place-1',
        expect.objectContaining({ category: validCategory })
      );
    });
  });

  describe('updateBookingMode - Business Rules', () => {
    it('should throw when booking mode not found', async () => {
      const owner = createMockUser();
      bookingRepo.findOneBy.mockResolvedValue(null);

      await expect(
        service.updateBookingMode('place-1', 'invalid-booking', owner)
      ).rejects.toThrow('Booking Mode to update not found');
    });

    it('should throw when booking mode is inactive', async () => {
      const owner = createMockUser();
      const inactiveBooking = { ...createMockBookingMode(), is_active: false };
      bookingRepo.findOneBy.mockResolvedValue(inactiveBooking);

      await expect(
        service.updateBookingMode('place-1', 'book-1', owner)
      ).rejects.toThrow(BadRequestException);
    });

    it('should update booking mode when valid', async () => {
      const owner = createMockUser();
      const validBooking = createMockBookingMode();
      const existingPlace = createMockPlace();

      bookingRepo.findOneBy.mockResolvedValue(validBooking);
      placeRepo.findOne.mockResolvedValue(existingPlace);
      placeRepo.update.mockResolvedValue({ affected: 1 } as any);

      const result = await service.updateBookingMode('place-1', 'book-1', owner);

      expect(result).toBeDefined();
    });
  });

  describe('updateCity - Business Rules', () => {
    it('should throw when city not found', async () => {
      const owner = createMockUser();
      cityRepo.findOneByOrFail.mockRejectedValue(new Error('City not found'));

      await expect(
        service.updateCity('place-1', 'invalid-city', owner)
      ).rejects.toThrow();
    });

    it('should throw when city is inactive', async () => {
      const owner = createMockUser();
      const inactiveCity = { ...createMockCity(), is_active: false };
      cityRepo.findOneByOrFail.mockResolvedValue(inactiveCity);

      await expect(
        service.updateCity('place-1', 'city-1', owner)
      ).rejects.toThrow();
    });

    it('should update city and return transformed DTO', async () => {
      const owner = createMockUser();
      const validCity = createMockCity();
      const existingPlace = createMockPlace();

      placeRepo.findOneOrFail.mockResolvedValue(existingPlace);
      cityRepo.findOneByOrFail.mockResolvedValue(validCity);
      placeRepo.save.mockResolvedValue({ ...existingPlace, city: validCity });

      const result = await service.updateCity('place-1', 'city-1', owner);

      expect(result).toBeDefined();
    });
  });

  describe('deleteImage - Business Flow', () => {
    it('should throw when image not found in place', async () => {
      const owner = createMockUser();
      placeRepo.findOne.mockResolvedValue(createMockPlace());
      placeImageRepo.findOne.mockResolvedValue(null);

      
    });
  });

  describe('Edge Cases & Error Handling', () => {
    it('should handle concurrent update requests gracefully', async () => {
    
    });

    it('should maintain data integrity on partial failures', async () => {
    
    });
  });
});