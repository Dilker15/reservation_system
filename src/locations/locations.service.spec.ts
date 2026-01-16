import { Test, TestingModule } from '@nestjs/testing';
import { LocationsService } from './locations.service';
import { AppLoggerService } from 'src/logger/logger.service';
import { EntityManager, Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UpdateLocationDto } from './dto/update.location.dto';
import { BadRequestException } from '@nestjs/common';
import { Place } from 'src/places/entities/place.entity';

describe('LocationsService', () => {
  let service: LocationsService;
  let mockLogger;
  let mockLocationRepo:Partial<jest.Mocked<Repository<Location>>>;
  let mockLocationData = {
      id: 'uuid',
      latitude: 10,
      longitude: 20,
      updated_at: null,
      place: { id: 'uuid-test' },
  };
  let loggerContext;

  beforeEach(async () => {
    jest.clearAllMocks();

    loggerContext = {
      error: jest.fn(),
      log: jest.fn(),
    };

    mockLogger = {
      withContext: jest.fn().mockReturnValue(loggerContext),
    };

    mockLocationRepo = {
      findOne:jest.fn().mockReturnValue(mockLocationData),
      save:jest.fn(),
    }
    

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationsService,
        {
          provide:AppLoggerService,
          useValue:mockLogger,
        },
        {
          provide:getRepositoryToken(Location),
          useValue:mockLocationRepo,
        }
      ],
    }).compile();

    service = module.get<LocationsService>(LocationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });



  it("should throw BadRequestException when place does not have a location",async()=>{
      const placeId = 'uuid-test';
      const updateDto :UpdateLocationDto = {latitude:111,longitude:222};
      mockLocationRepo.findOne?.mockResolvedValueOnce(null);
      await expect(service.updateByPlace(placeId,updateDto)).rejects.toThrow(BadRequestException);      
      expect(loggerContext.error).toHaveBeenCalledTimes(1);
  });


  it("should update location and save correct data",async()=>{
     const placeId = 'uuid-test';
     const updateDto :UpdateLocationDto = {latitude:111,longitude:222};
     const result = await service.updateByPlace(placeId,updateDto);
     expect(mockLocationRepo.save).toHaveBeenCalledWith(expect.objectContaining({
                                                        latitude: updateDto.latitude,
                                                        longitude: updateDto.longitude,
                                                        updated_at: expect.any(Date),
                                                      })
                                                    );
     expect(loggerContext.log).toHaveBeenCalled();
     expect(result).toEqual(expect.objectContaining({
        ...mockLocationData
     }));
  });


 it('should save location using repository when manager is not provided', async () => {
  const place = { id: 'place-id' } as Place;
  const latitude = 10;
  const longitude = 20;

  await service.create(place, latitude, longitude);

  expect(mockLocationRepo.save).toHaveBeenCalledWith({
    place,
    latitude,
    longitude,
  });
});


it('should save location using EntityManager repository when manager is provided', async () => {
  const place = { id: 'place-id' } as Place;
  const latitude = 10;
  const longitude = 20;

  const mockManagerRepo = {
    save: jest.fn(),
  };

  const mockEntityManager = {
    getRepository: jest.fn().mockReturnValue(mockManagerRepo),
  } as unknown as EntityManager;

  await service.create(place, latitude, longitude, mockEntityManager);

  expect(mockEntityManager.getRepository).toHaveBeenCalledWith(Location);
  expect(mockManagerRepo.save).toHaveBeenCalledWith({
    place,
    latitude,
    longitude,
  });
  expect(mockLocationRepo.save).not.toHaveBeenCalled();
});









});
