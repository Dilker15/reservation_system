import { Test, TestingModule } from '@nestjs/testing';
import { CountriesService } from './countries.service';
import { Repository } from 'typeorm';
import { Country } from './entities/country.entity';
import { City } from './entities/city.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { countries } from './data/countries';
import { AppLoggerService } from 'src/logger/logger.service';

describe('CountriesService', () => {
  let service: CountriesService;
  let mockCountryRepo:Partial<jest.Mocked<Repository<Country>>>;
  let mockCityRepo:Partial<jest.Mocked<Repository<City>>>;

  const mockCountries = [{name:"Bolivia"},{name:"Argentina"},{name:"España"}];

  const mockQueryBuilder = {
      leftJoinAndSelect:jest.fn().mockReturnThis(),
      where:jest.fn().mockReturnThis(),
      andWhere:jest.fn().mockReturnThis(),
      innerJoinAndSelect:jest.fn().mockReturnThis(),
      getOne:jest.fn()
  } as any;

  const mockLogger:Partial<jest.Mocked<AppLoggerService>> = {
    withContext:jest.fn().mockReturnValue({
        warn:jest.fn(),  
    })
  }


  beforeEach(async () => {
    jest.clearAllMocks();
    mockCountryRepo = {
      count:jest.fn().mockResolvedValue(0),
      save:jest.fn(),
      find:jest.fn().mockResolvedValue(mockCountries),
      findOne:jest.fn().mockResolvedValue(mockCountries[0]),
      createQueryBuilder:jest.fn(() => mockQueryBuilder)
    }

    mockCityRepo = {
      save:jest.fn(),
      createQueryBuilder:jest.fn(() => mockQueryBuilder)
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
        },
        {
          provide:AppLoggerService,
          useValue:mockLogger,
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
  });


  it("should throw a BadRequestExecption with countries exist",async()=>{
    mockCountryRepo.count?.mockResolvedValueOnce(1);
    await expect(service.insertCountriesAndCities()).rejects.toThrow(BadRequestException);
  });




  it("should return a list of countries" ,async()=>{
      const query = {where:{is_active:true}};
      const countries = await service.findAll();
      expect(mockCountryRepo.find).toHaveBeenCalledWith(query);
      expect(countries).toEqual(mockCountries);
  });



  it("should find and return a country",async()=>{
     const countryId = "uuid-country";
     const result = await service.findOneCountry(countryId);
     const query = {where:{is_active:true,id:countryId}};
     expect(mockCountryRepo.findOne).toHaveBeenCalledWith(query);
     expect(result).toEqual((mockCountries[0]))
  });



  it("should throw a BadRequestExcepion country not found",async()=>{
      const countryId = "uuid-country";
      const query = {where:{is_active:true,id:countryId}};
      mockCountryRepo.findOne?.mockResolvedValueOnce(null);
      await expect(service.findOneCountry(countryId)).rejects.toThrow(BadRequestException);
      expect(mockCountryRepo.findOne).toHaveBeenCalledWith(query);
  });


  it("should find and return an array of cities",async()=>{
     const countryId = 'uuid-country';
      const mockCountry = {
        id: countryId,
        name: 'Test Country',
        is_active: true,
        cities: [{ name: 'City 1' }],
      };

      mockQueryBuilder.getOne.mockResolvedValueOnce(mockCountry);

      const result = await service.findCitiesFromCountry(countryId);

      expect(mockCountryRepo.createQueryBuilder).toHaveBeenCalledWith('country');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'country.cities',
        'city',
        'city.is_active = :active',
        { active: true },
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('country.id = :countryId', { countryId });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('country.is_active = true');
      expect(result).toEqual(mockCountry);
  });




  it("should throw a BadRequesExeption city not found",async()=>{
      mockQueryBuilder.getOne.mockResolvedValueOnce(null);
      const countryId = "uuid-country";
      await expect(service.findCitiesFromCountry(countryId)).rejects.toThrow(BadRequestException);
  });


  
  it("should find an return a city",async()=>{
    const id_city="uuid-city";
    const id_country = "uuid-country";

    const mockCity = {
      name:"city-1",
      id:id_city,
    }

    mockQueryBuilder.getOne.mockResolvedValue(mockCity);
    const result = await service.findCity(id_country,id_city);
    expect(mockCityRepo.createQueryBuilder).toHaveBeenCalledWith('city');
    expect(mockQueryBuilder.where).toHaveBeenCalledWith('city.id = :id_city', { id_city });
    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith("city.is_active = true");
    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith("country.id = :id_country", { id_country });
    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith("country.is_active = true");
    expect(result).toEqual(mockCity)
  });

  it("should throw badRequest city not found",async()=>{
      const id_city="uuid-city";
      const id_country = "uuid-country";

      mockQueryBuilder.getOne.mockReturnValueOnce(null);
      await expect(service.findCity(id_country,id_city)).rejects.toThrow(BadRequestException);
  });















  

});
