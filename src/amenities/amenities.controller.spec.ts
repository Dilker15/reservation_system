import { Test, TestingModule } from '@nestjs/testing';
import { AmenitiesController } from './amenities.controller';
import { AmenitiesService } from './amenities.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Amenity } from './entities/amenity.entity';

describe('AmenitiesController', () => {
  let controller: AmenitiesController;

  const mockAmenityRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AmenitiesController],
      providers: [AmenitiesService,
        {
          provide:getRepositoryToken(Amenity),
          useValue:mockAmenityRepo
        }
      ],
    }).compile();

    controller = module.get<AmenitiesController>(AmenitiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
