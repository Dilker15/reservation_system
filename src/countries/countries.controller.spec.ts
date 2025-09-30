import { Test, TestingModule } from '@nestjs/testing';
import { CountriesController } from './countries.controller';
import { CountriesService } from './countries.service';

describe('CountriesController', () => {
  let controller: CountriesController;
  let mockCountryService: Partial<jest.Mocked<CountriesService>>;

  const mockCountries = [{name:"Bolivia"},{name:"Argentina"},{name:"España"}];


  beforeEach(async () => {

    mockCountryService = {
      insertCountriesAndCities:jest.fn(),
      findAll:jest.fn(),
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
      //const data = await controller.findAll();
      expect(mockCountryService.findAll).toHaveBeenCalledTimes(1);
      //expect(data).toEqual(mockCountries);
  });




});
