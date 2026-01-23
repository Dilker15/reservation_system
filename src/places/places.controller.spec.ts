import { Test, TestingModule } from '@nestjs/testing';
import { PlacesController } from './places.controller';
import { PlacesService } from './places.service';
import { ImageLocalService } from 'src/common/helpers/imageLocalService';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { User } from 'src/users/entities/user.entity';
import { Roles } from 'src/common/Interfaces';
import { AvailabilityDto } from './dto/availability.dto';
import { UpdateLocationDto } from 'src/locations/dto/update.location.dto';
import { CalendarAvailabityDto } from 'src/common/dtos/calendarAvailabity';
import { PlaceResponseDto } from './dto/place.response.dto';


jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-1234'),
}));

describe('PlacesController', () => {
  let controller: PlacesController;
  let placesService: PlacesService;
  let imageLocalService: ImageLocalService;

  const mockPlacesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    getMyPlaces: jest.fn(),
    updateBasicInformation: jest.fn(),
    updateImages: jest.fn(),
    updateCategory: jest.fn(),
    updateBookingMode: jest.fn(),
    deleteImage: jest.fn(),
    updateLocation: jest.fn(),
    updateCity: jest.fn(),
    getCalendar: jest.fn(),
  };

  const mockImageLocalService = {
    saveImagesToDisk: jest.fn(),
  };

  const mockUser: User = {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    email: 'owner@example.com',
    name: 'John',
    last_name: 'Doe',
    password: 'hashedPassword123',
    role: Roles.OWNER,
    is_active: true,
    email_verified: true,
    verification_code: null,
    created_at: new Date(),
    updated_at: new Date(),
  } as any;

  const mockPlaceResponse: PlaceResponseDto = {
    id: 'place-uuid-123-456',
    name: 'Test Restaurant',
    description: 'A great place to eat',
    address: '123 Main St',
    price: 50.0,
    location: {
      id: 'location-uuid-123',
      latitude: 40.7128,
      longitude: -74.006,
    },
    opening_hours: [
      {
        id: 'opening-hour-1',
        day: 1,
        open_time: '09:00',
        close_time: '18:00',
      },
    ],
    images: [
      {
        id: 'image-uuid-1',
        url: 'uploads/image1.jpg',
        storage_id:'storage_id_1'
      },
    ],
    category: {
      id: 'category-uuid-1',
      name: 'Restaurant',
      description:'description1',
    },
    booking_mode: {
      id: 'booking-mode-uuid-1',
      name: 'Immediate',
      min_duration:1,
      type:'hourly'
    },
    city: {
      id: 'city-uuid-1',
      name: 'New York',
     country: {
        id: 'country-uuid-1',
        name: 'United States',
        country_code:'AR'
      }
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlacesController],
      providers: [
        {
          provide: PlacesService,
          useValue: mockPlacesService,
        },
        {
          provide: ImageLocalService,
          useValue: mockImageLocalService,
        },
      ],
    }).compile();

    controller = module.get<PlacesController>(PlacesController);
    placesService = module.get<PlacesService>(PlacesService);
    imageLocalService = module.get<ImageLocalService>(ImageLocalService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Definition', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have PlacesService injected', () => {
      expect(placesService).toBeDefined();
    });

    it('should have ImageLocalService injected', () => {
      expect(imageLocalService).toBeDefined();
    });
  });

  describe('create', () => {
    const validOpeningHours: AvailabilityDto[] = [
      { day: 1, open_time: '09:00', close_time: '18:00' },
      { day: 2, open_time: '09:00', close_time: '18:00' },
    ];

    const validCreatePlaceDto: Partial<CreatePlaceDto> = {
      name: 'New Restaurant',
      description: 'A fantastic dining experience',
      address: '456 Park Ave',
      latitude: 40.758,
      longitude: -73.9855,
      price: 75.5,
      city_id: 'city-uuid-789',
      booking_mode_id: 'booking-mode-uuid-456',
      category_id: 'category-uuid-789',
    };

    const mockFiles: Express.Multer.File[] = [
      {
        fieldname: 'images',
        originalname: 'restaurant-front.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('fake-image-data'),
        size: 2048,
        stream: null,
        destination: '',
        filename: '',
        path: '',
      } as any
    ];

    it('should create a new place with all required fields and images', async () => {
      const mockImageRoutes = ['uploads/image1.jpg', 'uploads/image2.jpg'];
      const expectedResult = { ...mockPlaceResponse };

      mockImageLocalService.saveImagesToDisk.mockResolvedValue(mockImageRoutes);
      mockPlacesService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(
        validOpeningHours,
        validCreatePlaceDto,
        mockFiles,
        mockUser,
      );

      expect(imageLocalService.saveImagesToDisk).toHaveBeenCalledWith(mockFiles);
      expect(imageLocalService.saveImagesToDisk).toHaveBeenCalledTimes(1);
      expect(validCreatePlaceDto.opening_hours).toEqual(validOpeningHours);
      expect(placesService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...validCreatePlaceDto,
          opening_hours: validOpeningHours,
        }),
        mockImageRoutes,
        mockUser,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should create a place without images', async () => {
      const emptyFiles: Express.Multer.File[] = [];
      const mockImageRoutes: string[] = [];

      mockImageLocalService.saveImagesToDisk.mockResolvedValue(mockImageRoutes);
      mockPlacesService.create.mockResolvedValue(mockPlaceResponse);

      await controller.create(
        validOpeningHours,
        validCreatePlaceDto,
        emptyFiles,
        mockUser,
      );

      expect(imageLocalService.saveImagesToDisk).toHaveBeenCalledWith(emptyFiles);
      expect(placesService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          opening_hours: validOpeningHours,
        }),
        mockImageRoutes,
        mockUser,
      );
    });

    it('should propagate errors when image upload fails', async () => {
      const uploadError = new Error('Failed to save images to disk');
      mockImageLocalService.saveImagesToDisk.mockRejectedValue(uploadError);

      await expect(
        controller.create(validOpeningHours, validCreatePlaceDto, mockFiles, mockUser),
      ).rejects.toThrow('Failed to save images to disk');

      expect(imageLocalService.saveImagesToDisk).toHaveBeenCalledWith(mockFiles);
      expect(placesService.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated list of places with default pagination', async () => {
      const paginationDto: PaginationDto = {
        page: 1,
        limit: 10,
      };

      const expectedResult = {
        data: [mockPlaceResponse],
        total: 1,
        page: 1,
        limit: 10,
      };

      mockPlacesService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(paginationDto);

      expect(placesService.findAll).toHaveBeenCalledWith(paginationDto);
      expect(result).toEqual(expectedResult);
    });

    it('should filter places by category', async () => {
      const paginationDto: PaginationDto = {
        page: 1,
        limit: 10,
        category: 'category-uuid-123',
      };

      mockPlacesService.findAll.mockResolvedValue({
        data: [mockPlaceResponse],
        total: 1,
      });

      await controller.findAll(paginationDto);

      expect(placesService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'category-uuid-123',
        }),
      );
    });

    it('should filter places by price range', async () => {
      const paginationDto: PaginationDto = {
        page: 1,
        limit: 10,
        min_price: 20,
        max_price: 100,
      };

      mockPlacesService.findAll.mockResolvedValue({
        data: [mockPlaceResponse],
        total: 1,
      });

      await controller.findAll(paginationDto);

      expect(placesService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          min_price: 20,
          max_price: 100,
        }),
      );
    });

    it('should handle empty results', async () => {
      const paginationDto: PaginationDto = {
        page: 1,
        limit: 10,
      };

      mockPlacesService.findAll.mockResolvedValue({
        data: [],
        total: 0,
      });

      const result = await controller.findAll(paginationDto);

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('findOne', () => {
    it('should return a place by valid UUID', async () => {
      const placeId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

      mockPlacesService.findOne.mockResolvedValue(mockPlaceResponse);

      const result = await controller.findOne(placeId);

      expect(placesService.findOne).toHaveBeenCalledWith(placeId);
      expect(result).toEqual(mockPlaceResponse);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
    });

    it('should throw error when place is not found', async () => {
      const placeId = 'non-existent-uuid-1234';
      const notFoundError = new Error('Place not found');

      mockPlacesService.findOne.mockRejectedValue(notFoundError);

      await expect(controller.findOne(placeId)).rejects.toThrow('Place not found');
      expect(placesService.findOne).toHaveBeenCalledWith(placeId);
    });
  });

  describe('getPlacesOwner', () => {
    it('should return all places owned by the authenticated user', async () => {
      const ownedPlaces = [mockPlaceResponse];

      mockPlacesService.getMyPlaces.mockResolvedValue(ownedPlaces);

      const result = await controller.getPlacesOwner(mockUser);

      expect(placesService.getMyPlaces).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(ownedPlaces);
      expect(result).toHaveLength(1);
    });

    it('should return empty array when owner has no places', async () => {
      mockPlacesService.getMyPlaces.mockResolvedValue([]);

      const result = await controller.getPlacesOwner(mockUser);

      expect(placesService.getMyPlaces).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual([]);
    });
  });

  describe('updatePlace', () => {
    const placeId = 'place-uuid-to-update';

    it('should update place basic information', async () => {
      const updateDto: UpdatePlaceDto = {
        name: 'Updated Restaurant Name',
        description: 'Updated description',
      };

      const updatedPlace = { ...mockPlaceResponse, ...updateDto };
      mockPlacesService.updateBasicInformation.mockResolvedValue(updatedPlace);

      const result = await controller.updatePlace(updateDto, placeId, mockUser);

      expect(placesService.updateBasicInformation).toHaveBeenCalledWith(
        updateDto,
        placeId,
        mockUser,
      );
      expect(result?.name).toBe(updateDto.name);
      expect(result?.description).toBe(updateDto.description);
    });

    it('should update place price', async () => {
      const updateDto: UpdatePlaceDto = {
        price: 120.5,
      };

      const updatedPlace = { ...mockPlaceResponse, price: 120.5 };
      mockPlacesService.updateBasicInformation.mockResolvedValue(updatedPlace);

      const result = await controller.updatePlace(updateDto, placeId, mockUser);

      expect(result?.price).toBe(120.5);
    });
  });

  describe('updatePlacesImages', () => {
    const placeId = 'place-uuid-for-images';

    it('should update place images with new files', async () => {
      const newImages: Express.Multer.File[] = [
        {
          fieldname: 'imagesToUpdate',
          originalname: 'new-photo1.jpg',
          encoding: '7bit',
          mimetype: 'image/jpeg',
          buffer: Buffer.from('image-data-1'),
          size: 4096,
        } as Express.Multer.File,
      ];

      const imageRoutes = ['uploads/new-photo1.jpg'];
      const updatedPlace = {
        ...mockPlaceResponse,
        images: [{ id: 'image-uuid-new', url: 'uploads/new-photo1.jpg' }],
      };

      mockImageLocalService.saveImagesToDisk.mockResolvedValue(imageRoutes);
      mockPlacesService.updateImages.mockResolvedValue(updatedPlace);

      const result = await controller.updatePlacesImages(
        placeId,
        mockUser,
        newImages,
      );

      expect(imageLocalService.saveImagesToDisk).toHaveBeenCalledWith(newImages);
      expect(placesService.updateImages).toHaveBeenCalledWith(
        placeId,
        mockUser,
        imageRoutes,
      );
    });

    it('should propagate error when image save fails', async () => {
      const images: Express.Multer.File[] = [
        {
          originalname: 'corrupted.jpg',
        } as Express.Multer.File,
      ];

      const saveError = new Error('Disk write failed');
      mockImageLocalService.saveImagesToDisk.mockRejectedValue(saveError);

      await expect(
        controller.updatePlacesImages(placeId, mockUser, images),
      ).rejects.toThrow('Disk write failed');

      expect(placesService.updateImages).not.toHaveBeenCalled();
    });
  });

  describe('updatePlaceCategory', () => {
    const placeId = 'place-uuid-123';

    it('should update place category successfully', async () => {
      const newCategoryId = 'new-category-uuid-789';
      const updatedPlace = {
        ...mockPlaceResponse,
        category: { id: newCategoryId, name: 'Bar' },
      };

      mockPlacesService.updateCategory.mockResolvedValue(updatedPlace);

      const result = await controller.updatePlaceCategory(
        placeId,
        newCategoryId,
        mockUser,
      );

      expect(placesService.updateCategory).toHaveBeenCalledWith(
        placeId,
        newCategoryId,
        mockUser,
      );
      expect(result.category.id).toBe(newCategoryId);
    });

    it('should throw error when category does not exist', async () => {
      const invalidCategoryId = 'non-existent-category';
      const categoryError = new Error('Category not found');

      mockPlacesService.updateCategory.mockRejectedValue(categoryError);

      await expect(
        controller.updatePlaceCategory(placeId, invalidCategoryId, mockUser),
      ).rejects.toThrow('Category not found');
    });
  });

  describe('updatePlaceBookingMode', () => {
    const placeId = 'place-uuid-456';

    it('should update booking mode successfully', async () => {
      const newBookingModeId = 'booking-mode-uuid-new';
      const updatedPlace = {
        ...mockPlaceResponse,
        booking_mode: { id: newBookingModeId, name: 'Approval Required' },
      };

      mockPlacesService.updateBookingMode.mockResolvedValue(updatedPlace);

      const result = await controller.updatePlaceBookingMode(
        placeId,
        newBookingModeId,
        mockUser,
      );

      expect(placesService.updateBookingMode).toHaveBeenCalledWith(
        placeId,
        newBookingModeId,
        mockUser,
      );
      expect(result.booking_mode.id).toBe(newBookingModeId);
    });
  });

  describe('deleteImageFromPlace', () => {
    const placeId = 'place-uuid-789';
    const imageId = 'image-uuid-to-delete';

    it('should delete an image from place successfully', async () => {
      const deleteResponse = {
        message: 'Image deleted successfully',
        deletedImageId: imageId,
      };

      mockPlacesService.deleteImage.mockResolvedValue(deleteResponse);

      const result = await controller.deleteImageFromPlace(
        placeId,
        imageId,
        mockUser,
      );

      expect(placesService.deleteImage).toHaveBeenCalledWith(
        placeId,
        imageId,
        mockUser,
      );
      expect(result).toEqual(deleteResponse);
    });

    it('should throw error when image does not belong to place', async () => {
      const wrongImageId = 'wrong-image-uuid';
      const imageError = new Error('Image not found in this place');

      mockPlacesService.deleteImage.mockRejectedValue(imageError);

      await expect(
        controller.deleteImageFromPlace(placeId, wrongImageId, mockUser),
      ).rejects.toThrow('Image not found in this place');
    });
  });

  describe('updateLocation', () => {
    const placeId = 'place-uuid-location-update';

    it('should update place coordinates', async () => {
      const newLocation: UpdateLocationDto = {
        latitude: 34.0522,
        longitude: -118.2437,
      };

      const updatedPlace = {
        ...mockPlaceResponse,
        location: {
          id: 'location-uuid-new',
          latitude: 34.0522,
          longitude: -118.2437,
        },
      };

      mockPlacesService.updateLocation.mockResolvedValue(updatedPlace);

      await controller.updateLocation(placeId,newLocation,mockUser);
      expect(placesService.updateLocation).toHaveBeenCalledWith(
        placeId,
        newLocation,
        mockUser,
      );
    });
  });

  describe('updateCity', () => {
    const placeId = 'place-uuid-city-update';

    it('should update place city successfully', async () => {
      const newCityId = 'city-uuid-new-789';
      const updatedPlace = {
        ...mockPlaceResponse,
        city: { id: newCityId, name: 'Los Angeles' },
      };

      mockPlacesService.updateCity.mockResolvedValue(updatedPlace);

      const result = await controller.updateCity(placeId, newCityId, mockUser);

      expect(placesService.updateCity).toHaveBeenCalledWith(
        placeId,
        newCityId,
        mockUser,
      );
      expect(result?.city.id).toBe(newCityId);
    });

    it('should throw error when city does not exist', async () => {
      const invalidCityId = 'non-existent-city';
      const cityError = new Error('City not found');

      mockPlacesService.updateCity.mockRejectedValue(cityError);

      await expect(
        controller.updateCity(placeId, invalidCityId, mockUser),
      ).rejects.toThrow('City not found');
    });
  });

  describe('getShedule', () => {
    const placeId = 'place-uuid-schedule';

    it('should return place schedule for given date range', async () => {
      const calendarDto: CalendarAvailabityDto = {
        start_date: '2024-01-01',
        end_date: '2024-01-31',
      };

      const expectedResult = {
        schedules: [
          { date: '2024-01-01', available: true },
          { date: '2024-01-02', available: false },
        ],
      };

      mockPlacesService.getCalendar.mockResolvedValue(expectedResult);

      const result = await controller.getShedule(placeId, calendarDto);

      expect(placesService.getCalendar).toHaveBeenCalledWith(
        placeId,
        calendarDto,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should handle optional date parameters', async () => {
      const calendarDto: CalendarAvailabityDto = {};

      mockPlacesService.getCalendar.mockResolvedValue({ schedules: [] });

      await controller.getShedule(placeId, calendarDto);

      expect(placesService.getCalendar).toHaveBeenCalledWith(
        placeId,
        calendarDto,
      );
    });
  });
});