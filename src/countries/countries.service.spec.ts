import { Test, TestingModule } from '@nestjs/testing';
import { CountriesService } from './countries.service';
import { Repository } from 'typeorm';
import { Country } from './entities/country.entity';
import { City } from './entities/city.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { countries } from './data/countries';

describe('CountriesService', () => {
  let service: CountriesService;
  let mockCountryRepo:Partial<jest.Mocked<Repository<Country>>>;
  let mockCityRepo:Partial<jest.Mocked<Repository<City>>>;


  beforeEach(async () => {
    jest.clearAllMocks();
    mockCountryRepo = {
      count:jest.fn().mockResolvedValue(0),
      save:jest.fn(),
    }

    mockCityRepo = {
      save:jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountriesService,
        {
          provide:getRepositoryToken(Country),
          useValue:mockCountryRepo
        },
        {
          provide:getRepositoryToken(City),
          useValue:mockCityRepo,
        }
      ],

    }).compile();

    service = module.get<CountriesService>(CountriesService);

  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });


  it("should insert CountriesAndCities with correct data",async()=>{
     await service.insertCountriesAndCities();
     expect(mockCountryRepo.count).toHaveBeenCalled();
     expect(mockCountryRepo.save).toHaveBeenCalledTimes(countries.length);
     expect(mockCountryRepo.save).toHaveBeenCalledWith({"name": "Bolivia","country_code": "BO"})
     const totalCities = countries.reduce((acc, c) => acc + c.cities.length, 0);
     expect(mockCityRepo.save).toHaveBeenCalledTimes(totalCities);
  });


  it("should throw a BadRequestExecption with countries exist",async()=>{
    mockCountryRepo.count?.mockResolvedValueOnce(1);
    await expect(service.insertCountriesAndCities()).rejects.toThrow(BadRequestException);
  });


  it("should return a countries list",async()=>{
     const data = await service.findAll();
     expect(data.length).toBeGreaterThan(1);
     expect(data).toEqual(countries);
  });


});
