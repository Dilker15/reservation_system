import { Test, TestingModule } from '@nestjs/testing';
import { PlacesService } from './places.service';
import { DataSource, Repository } from 'typeorm';
import { Place } from './entities/place.entity';
import { PlaceImages } from './entities/place-images.entity';
import { Category } from 'src/categories/entities/category.entity';
import { BookingMode } from 'src/booking-mode/entities/booking-mode.entity';
import { City } from 'src/countries/entities/city.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

import { User } from 'src/users/entities/user.entity';
import { placeEnumStatus } from './interfaces/interfaces';
import { EnqueueImagesUploadServices } from 'src/queue-bull/enqueue-images.services';
import { AppLoggerService } from 'src/logger/logger.service';
import { LocationsService } from 'src/locations/locations.service';
import { ImageUploadService } from 'src/image-upload/image-upload.service';
import { OpeningHour } from 'src/opening-hours/entities/opening-hour.entity';
import { ReservationService } from 'src/reservation/reservation.service';
import { CacheRedisService } from 'src/cache-redis/cache-redis.service';

describe('PlacesService', () => {
  let service: PlacesService;
  let moduleRef: TestingModule;

  let placeRepo: jest.Mocked<Repository<Place>>;
  let placeImageRepo: jest.Mocked<Repository<PlaceImages>>;
  let categoryRepo: jest.Mocked<Repository<Category>>;
  let bookingRepo: jest.Mocked<Repository<BookingMode>>;
  let cityRepo: jest.Mocked<Repository<City>>;

  const createMockUser = (id = 'user-1'): User =>
    ({
      id,
      email: 'test@test.com',
    }) as User;

  const createMockPlace = (overrides = {}): Place =>
    ({
      id: 'place-1',
      name: 'Luxury Apartment',
      description: 'Beautiful place',
      address: 'Street 123',
      price: 100,
      max_guests: 4,
      bedrooms: 2,
      bathrooms: 1,
      size_m2: 120,
      status: placeEnumStatus.ACTIVE,
      images: [],
      owner: createMockUser(),
      category: {
        id: 'cat-1',
        name: 'Category',
      } as Category,
      booking_mode: {
        id: 'book-1',
        name: 'Hourly',
      } as BookingMode,
      city: {
        id: 'city-1',
        name: 'Buenos Aires',
      } as City,
      location: {
        latitude: 10,
        longitude: 20,
      },
      opening_hours: [],
      amenities: [],
      ...overrides,
    }) as unknown as Place

  beforeEach(async () => {
    const mockPlaceRepo = {
      find: jest.fn(),
      update: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(),
      findOneOrFail: jest.fn(),
      findOne: jest.fn(),
    };

    const mockPlaceImageRepo = {
      findOne: jest.fn(),
      remove: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockCategoryRepo = {
      findOneBy: jest.fn(),
    };

    const mockBookingRepo = {
      findOneBy: jest.fn(),
    };

    const mockCityRepo = {
      findOneByOrFail: jest.fn(),
    };

    const mockOpeningHourRepo = {
      createQueryBuilder: jest.fn(),
    };

    const mockEnqueueService = {
      enqueImagesToUpload: jest.fn(),
      enqueImageToUpdate: jest.fn(),
    };

    const mockLoggerContext = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };

    const mockLogger = {
      withContext: jest.fn().mockReturnValue(mockLoggerContext),
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };

    const mockLocationService = {
      updateByPlace: jest.fn(),
    };

    const mockImageUploadService = {
      deleteImage: jest.fn(),
    };

    const mockReservationService = {
      getAvailabilityDaily: jest.fn(),
      getAvailabilityRange: jest.fn(),
    };

    const mockCacheService = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn(),
      del: jest.fn(),
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

    moduleRef = await Test.createTestingModule({
      providers: [
        PlacesService,
        {
          provide: getRepositoryToken(Place),
          useValue: mockPlaceRepo,
        },
        {
          provide: getRepositoryToken(PlaceImages),
          useValue: mockPlaceImageRepo,
        },
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepo,
        },
        {
          provide: getRepositoryToken(BookingMode),
          useValue: mockBookingRepo,
        },
        {
          provide: getRepositoryToken(City),
          useValue: mockCityRepo,
        },
        {
          provide: getRepositoryToken(OpeningHour),
          useValue: mockOpeningHourRepo,
        },
        {
          provide: EnqueueImagesUploadServices,
          useValue: mockEnqueueService,
        },
        {
          provide: AppLoggerService,
          useValue: mockLogger,
        },
        {
          provide: LocationsService,
          useValue: mockLocationService,
        },
        {
          provide: ImageUploadService,
          useValue: mockImageUploadService,
        },
        {
          provide: ReservationService,
          useValue: mockReservationService,
        },
        {
          provide: CacheRedisService,
          useValue: mockCacheService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = moduleRef.get<PlacesService>(PlacesService);

    placeRepo = moduleRef.get(getRepositoryToken(Place));
    placeImageRepo = moduleRef.get(getRepositoryToken(PlaceImages));
    categoryRepo = moduleRef.get(getRepositoryToken(Category));
    bookingRepo = moduleRef.get(getRepositoryToken(BookingMode));
    cityRepo = moduleRef.get(getRepositoryToken(City));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    let mockQueryBuilder: any;

    beforeEach(() => {
      mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getOne: jest.fn(),
      };

      placeRepo.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );
    });

    it('should return place successfully', async () => {
      const place = createMockPlace();

      mockQueryBuilder.getOne.mockResolvedValue(place);

      const result = await service.findOne('place-1');

      expect(placeRepo.createQueryBuilder)
        .toHaveBeenCalledWith('place');

      expect(mockQueryBuilder.where)
        .toHaveBeenCalledWith(
          'place.id = :id',
          { id: 'place-1' },
        );

      expect(mockQueryBuilder.andWhere)
        .toHaveBeenCalledWith(
          'place.status = :status',
          { status: placeEnumStatus.ACTIVE },
        );

      expect(result.id).toBe(place.id);
    });

    it('should filter by owner', async () => {
      const owner = createMockUser('owner-1');

      mockQueryBuilder.getOne.mockResolvedValue(
        createMockPlace(),
      );

      await service.findOne('place-1', owner);

      expect(mockQueryBuilder.andWhere)
        .toHaveBeenCalledWith(
          'place.owner_id = :ownerId',
          { ownerId: owner.id },
        );
    });

    it('should throw BadRequestException if place does not exist', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      await expect(
        service.findOne('invalid-id'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException on unexpected errors', async () => {
      mockQueryBuilder.getOne.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        service.findOne('place-1'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getMyPlaces', () => {
    let mockQueryBuilder: any;

    beforeEach(() => {
      mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        clone: jest.fn().mockReturnThis(),
        getCount: jest.fn(),
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawMany: jest.fn(),
      };

      placeRepo.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );
    });

    it('should return paginated owner places', async () => {
      const owner = createMockUser();

      const items = [
        {
          id: 'place-1',
          name: 'Luxury Apartment',
        },
      ];

      mockQueryBuilder.getCount.mockResolvedValue(1);

      mockQueryBuilder.getRawMany.mockResolvedValue(items);

      const result = await service.getMyPlaces(owner, {
        page: 1,
        limit: 10,
      } as any);

      expect(result).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        items,
      });
    });

    it('should filter by status', async () => {
      const owner = createMockUser();

      mockQueryBuilder.getCount.mockResolvedValue(0);
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      await service.getMyPlaces(owner, {
        status: placeEnumStatus.ACTIVE,
      } as any);

      expect(mockQueryBuilder.andWhere)
        .toHaveBeenCalledWith(
          'place.status = :status',
          { status: placeEnumStatus.ACTIVE },
        );
    });

    it('should filter by name', async () => {
      const owner = createMockUser();

      mockQueryBuilder.getCount.mockResolvedValue(0);
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      await service.getMyPlaces(owner, {
        name: 'luxury',
      } as any);

      expect(mockQueryBuilder.andWhere)
        .toHaveBeenCalledWith(
          'LOWER(place.name) LIKE LOWER(:name)',
          { name: '%luxury%' },
        );
    });
  });

  describe('findAll', () => {
    let mockQueryBuilder: any;
    let cacheService: CacheRedisService;

    beforeEach(() => {
      cacheService = moduleRef.get(CacheRedisService);

      mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn(),
      };

      placeRepo.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );
    });

    it('should return cached data', async () => {
      const cached = {
        total: 1,
        data: [],
      };

      cacheService.get = jest.fn().mockResolvedValue(cached);

      const result = await service.findAll({});

      expect(result).toEqual(cached);

      expect(mockQueryBuilder.getManyAndCount)
        .not.toHaveBeenCalled();
    });

    it('should query database and cache response', async () => {
      cacheService.get = jest.fn().mockResolvedValue(null);

      const places = [createMockPlace()];

      mockQueryBuilder.getManyAndCount.mockResolvedValue([
        places,
        1,
      ]);

      placeRepo.find.mockResolvedValue([
        createMockPlace({
          images: [
            {
              url: 'https://cloudinary.com/image.jpg',
            },
          ],
        }),
      ]);

      const result = await service.findAll({
        page: 1,
        limit: 10,
      });

      expect(mockQueryBuilder.getManyAndCount)
        .toHaveBeenCalled();

      expect(cacheService.set)
        .toHaveBeenCalled();
    });
  });

  describe('updateImages', () => {
    beforeEach(() => {
      jest.spyOn(service, 'findOne');
    });

    it('should reject if total images exceed 5', async () => {
      const owner = createMockUser();

      jest.spyOn(service, 'findOne')
        .mockResolvedValue({
          images: [
            { id: '1' },
            { id: '2' },
            { id: '3' },
            { id: '4' },
          ],
        } as any);

      await expect(
        service.updateImages(
          'place-1',
          owner,
          ['file1.jpg', 'file2.jpg'],
        ),
      ).rejects.toThrow(
        'Max number of total files accepted 5,remove files',
      );
    });

    it('should enqueue images update successfully', async () => {
      const owner = createMockUser();

      jest.spyOn(service, 'findOne')
        .mockResolvedValue({
          images: [{ id: '1' }],
        } as any);

      const enqueueService = moduleRef.get(
        EnqueueImagesUploadServices,
      );

      const result = await service.updateImages(
        'place-1',
        owner,
        ['file1.jpg'],
      );

      expect(
        enqueueService.enqueImageToUpdate,
      ).toHaveBeenCalledWith(
        'place-1',
        ['file1.jpg'],
        owner.id,
      );

      expect(result?.message)
        .toContain('images will be updated');
    });
  });

  describe('updateCategory', () => {
    beforeEach(() => {
      jest.spyOn(service, 'findOne');
    });

    it('should throw if category does not exist', async () => {
      categoryRepo.findOneBy.mockResolvedValue(null);

      await expect(
        service.updateCategory(
          'place-1',
          'invalid-category',
          createMockUser(),
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update category successfully', async () => {
      const category = {
        id: 'cat-1',
        is_active: true,
      };

      categoryRepo.findOneBy.mockResolvedValue(
        category as any,
      );

      jest.spyOn(service, 'findOne')
        .mockResolvedValue(createMockPlace());

      await service.updateCategory(
        'place-1',
        'cat-1',
        createMockUser(),
      );

      expect(placeRepo.update)
        .toHaveBeenCalledWith(
          'place-1',
          expect.objectContaining({
            category,
          }),
        );
    });
  });

  describe('updateBookingMode', () => {
    beforeEach(() => {
      jest.spyOn(service, 'findOne');
    });

    it('should throw if booking mode does not exist', async () => {
      bookingRepo.findOneBy.mockResolvedValue(null);

      await expect(
        service.updateBookingMode(
          'place-1',
          'invalid-booking',
          createMockUser(),
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update booking mode successfully', async () => {
      const booking = {
        id: 'book-1',
        is_active: true,
      };

      bookingRepo.findOneBy.mockResolvedValue(
        booking as any,
      );

      jest.spyOn(service, 'findOne')
        .mockResolvedValue(createMockPlace());

      await service.updateBookingMode(
        'place-1',
        'book-1',
        createMockUser(),
      );

      expect(placeRepo.update)
        .toHaveBeenCalledWith(
          'place-1',
          expect.objectContaining({
            booking_mode: booking,
          }),
        );
    });
  });

  describe('deleteImage', () => {
    beforeEach(() => {
      jest.spyOn(service, 'findOne')
        .mockResolvedValue(createMockPlace());
    });

    it('should delete image successfully', async () => {
      const owner = createMockUser();

      const image = {
        id: 'image-1',
        storage_id: 'cloudinary-id',
      };

      placeImageRepo.findOne.mockResolvedValue(
        image as any,
      );

      const imageUploadService = moduleRef.get(
        ImageUploadService,
      );

      const result = await service.deleteImage(
        'place-1',
        'image-1',
        owner,
      );

      expect(placeImageRepo.remove)
        .toHaveBeenCalledWith(image);

      expect(imageUploadService.deleteImage)
        .toHaveBeenCalledWith('cloudinary-id');

      expect(result).toEqual(image);
    });

    it('should throw if image does not exist', async () => {
      placeImageRepo.findOne.mockResolvedValue(null);

      await expect(
        service.deleteImage(
          'place-1',
          'invalid-image',
          createMockUser(),
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should continue even if cloud deletion fails', async () => {
      const image = {
        id: 'image-1',
        storage_id: 'cloudinary-id',
      };

      placeImageRepo.findOne.mockResolvedValue(
        image as any,
      );

      const imageUploadService = moduleRef.get(
        ImageUploadService,
      );

      imageUploadService.deleteImage = jest.fn()
        .mockRejectedValue(
          new Error('Cloudinary error'),
        );

      const result = await service.deleteImage(
        'place-1',
        'image-1',
        createMockUser(),
      );

      expect(placeImageRepo.remove)
        .toHaveBeenCalled();

      expect(result).toEqual(image);
    });
  });
});