import { Test, TestingModule } from '@nestjs/testing';
import { AmenitiesService } from './amenities.service';
import { Repository } from 'typeorm';
import { Amenity } from './entities/amenity.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { amenitiesData } from './data/amenities.data';

describe('AmenitiesService', () => {
  let service: AmenitiesService;

  let mockRepo = {
    create: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {

    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AmenitiesService,
        {
          provide: getRepositoryToken(Amenity),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<AmenitiesService>(AmenitiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {

    it('should not create amenities if they already exist', async () => {

      mockRepo.count.mockResolvedValue(5);

      const createSpy = jest.spyOn(mockRepo, 'create');
      const saveSpy = jest.spyOn(mockRepo, 'save');

      await service.create();

      expect(mockRepo.count).toHaveBeenCalled();

      expect(createSpy).not.toHaveBeenCalled();
      expect(saveSpy).not.toHaveBeenCalled();
    });

    it('should create amenities successfully', async () => {

      mockRepo.count.mockResolvedValue(0);

      const amenitiesCreated = amenitiesData.map(item => ({
        name: item.name,
      }));

      mockRepo.create.mockReturnValue(amenitiesCreated);

      mockRepo.save.mockResolvedValue(amenitiesCreated);

      await service.create();

      expect(mockRepo.count).toHaveBeenCalled();

      expect(mockRepo.create).toHaveBeenCalledWith(
        amenitiesData.map(item => ({
          name: item.name,
        }))
      );

      expect(mockRepo.save).toHaveBeenCalledWith(
        amenitiesCreated
      );
    });

  });

  describe('findAll', () => {

    it('should return all active amenities', async () => {

      const amenities = [
        {
          id: '1',
          name: 'Pool',
          is_active: true,
        },
        {
          id: '2',
          name: 'Wifi',
          is_active: true,
        },
      ];

      mockRepo.find.mockResolvedValue(amenities);

      const result = await service.findAll();

      expect(mockRepo.find).toHaveBeenCalledWith({
        where: {
          is_active: true,
        },
      });

      expect(result).toEqual(amenities);
    });

  });

});