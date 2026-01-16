import { Test, TestingModule } from '@nestjs/testing';
import { OpeningHoursService } from './opening-hours.service';
import { Repository } from 'typeorm';
import { OpeningHour } from './entities/opening-hour.entity';
import { AppLoggerService } from 'src/logger/logger.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PlacesService } from 'src/places/places.service';
import { UpdateOpeningHourDto } from './dto/update-opening-hour.dto';
import { NotFoundException } from '@nestjs/common';

describe('OpeningHoursService', () => {

  let service: OpeningHoursService;
  let mockOpeningRepo: Partial<jest.Mocked<Repository<OpeningHour>>>;
  let mockLogger: Partial<jest.Mocked<AppLoggerService>>;
  let mockPlaceService: Partial<jest.Mocked<PlacesService>>;

  const mockOpeningData = {
    id: 'opening-id',
    open_time: '09:00',
    close_time: '18:00',
    is_active: true,
    place: { id: 'place-1' },
  } as any;

  beforeEach(async () => {
    mockLogger = {
      withContext: jest.fn().mockReturnThis(),
      log: jest.fn(),
    };

    mockOpeningRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    mockPlaceService = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpeningHoursService,
        {
          provide: getRepositoryToken(OpeningHour),
          useValue: mockOpeningRepo,
        },
        {
          provide: AppLoggerService,
          useValue: mockLogger,
        },
        {
          provide: PlacesService,
          useValue: mockPlaceService,
        },
      ],
    }).compile();

    service = module.get<OpeningHoursService>(OpeningHoursService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });


  it('should update opening hours when valid data is provided', async () => {
    const id = 'opening-id';
    const owner = { id: 'owner-id', name: 'owner-name' } as any;

    const updateData: UpdateOpeningHourDto = {
      open_time: '10:00',
      close_time: '20:20',
      place_id: 'place-1',
    };

    mockOpeningRepo.findOne?.mockResolvedValueOnce(mockOpeningData);
    mockOpeningRepo.save?.mockResolvedValueOnce({
      ...mockOpeningData,
      ...updateData,
    } as any);

    const result = await service.update(id, updateData, owner);

    expect(mockPlaceService.findOne).toHaveBeenCalledWith(
      updateData.place_id,
      owner,
    );

    expect(mockOpeningRepo.findOne).toHaveBeenCalledWith({
      where: { id },
    });

    expect(mockOpeningRepo.save).toHaveBeenCalled();
    expect(mockLogger.log).toHaveBeenCalled();

    expect(result).toMatchObject({
      open_time: updateData.open_time,
      close_time: updateData.close_time,
    });
  });

  it('should throw NotFoundException when opening hour does not exist (update)', async () => {
    const id = 'opening-id';
    const owner = { id: 'owner-id' } as any;

    const updateData: UpdateOpeningHourDto = {
      open_time: '10:00',
      close_time: '20:20',
      place_id: 'place-1',
    };

    mockOpeningRepo.findOne?.mockResolvedValueOnce(null);

    await expect(
      service.update(id, updateData, owner),
    ).rejects.toThrow(NotFoundException);
  });


  it('should remove opening hour when it exists and belongs to the place', async () => {
    const hourId = 'hour-id';
    const placeId = 'place-1';
    const owner = { id: 'owner-id', name: 'owner-name' } as any;


    mockOpeningRepo.findOne?.mockResolvedValueOnce(mockOpeningData);
    mockOpeningRepo.remove?.mockResolvedValueOnce(mockOpeningData);

    const result = await service.remove(hourId, placeId, owner);

    expect(mockPlaceService.findOne).toHaveBeenCalledWith(placeId, owner);

    expect(mockOpeningRepo.findOne).toHaveBeenCalledWith({
      where: {
        id: hourId,
        is_active: true,
        place: { id: placeId },
      },
    });

    expect(mockOpeningRepo.remove).toHaveBeenCalledWith(mockOpeningData);
    expect(mockLogger.log).toHaveBeenCalled();

    expect(result).toMatchObject({
      id: mockOpeningData.id,
      open_time: mockOpeningData.open_time,
      close_time: mockOpeningData.close_time,
    });
  });

  it('should throw NotFoundException when opening hour does not exist (remove)', async () => {
    const hourId = 'hour-id';
    const placeId = 'place-1';
    const owner = { id: 'owner-id' } as any;

    mockOpeningRepo.findOne?.mockResolvedValueOnce(null);

    await expect(
      service.remove(hourId, placeId, owner),
    ).rejects.toThrow(NotFoundException);
  });
});
