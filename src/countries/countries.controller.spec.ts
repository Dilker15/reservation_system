import { Test, TestingModule } from '@nestjs/testing';
import { CountriesController } from './countries.controller';
import { CountriesService } from './countries.service';

describe('CountriesController', () => {
  let controller: CountriesController;
  let mockCountryService: Partial<jest.Mocked<CountriesService>>;

  const mockCountries = [{name:"Bolivia"},{name:"Argentina"},{name:"España"}];
  const mockCities = ['Santa Cruz',"La Paz"];

  beforeEach(async () => {

    mockCountryService = {
      insertCountriesAndCities:jest.fn(),
      findAll:jest.fn(),
      findOneCountry:jest.fn().mockResolvedValue(mockCountries[0]),
      findCitiesFromCountry:jest.fn().mockResolvedValue(mockCities),
      findCity:jest.fn().mockResolvedValue(mockCities[0])
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CountriesController],
      providers: [
        {
          provide:CountriesService,
          useValue:mockCountryService,
        }
      ],
    }).compile();

    controller = module.get<CountriesController>(CountriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });



  it("should call service.insertCountriesAndCities",async()=>{
     await controller.create();
     expect(mockCountryService.insertCountriesAndCities).toHaveBeenCalledTimes(1);
  });


  it("should call service.findAll and return countries list",async()=>{

      mockCountryService.findAll?.mockResolvedValueOnce(mockCountries as any);
      const data = await controller.findAllCountries();
      expect(mockCountryService.findAll).toHaveBeenCalledTimes(1);
      expect(data).toEqual(mockCountries);
  });



  it("should call findCountry with ID and return a Country",async()=>{
     const countryId = 'uuid-test';
     const data = await controller.findCountry(countryId);
     expect(mockCountryService.findOneCountry).toHaveBeenCalledWith(countryId);
     expect(data).toEqual({name:'Bolivia'})
  });



  it("should get a list of cities from a country",async()=>{
      const countryId = 'uuid-test';
      const cities = await controller.getCitiesFromCountry(countryId);
      expect(mockCountryService.findCitiesFromCountry).toHaveBeenCalledWith(countryId);
      expect(cities).toEqual(mockCities);
  });



  it("should return data from a active city",async()=>{
    const countryId = 'uuid-country';
    const cityId = 'uuid-city';
    const city = await controller.getCity(countryId,cityId);
    expect(mockCountryService.findCity).toHaveBeenCalledWith(countryId,cityId);
    expect(city).toEqual(mockCities[0]);

  });


});
