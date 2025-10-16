import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { Role } from 'src/auth/decorators/role.decorator';

@Controller('countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Public()
  @Post()
  //@Role('web-master')  JUST FOR ADMIN PANEL
  create() {
    return this.countriesService.insertCountriesAndCities();
  }

  @Public()
  @Get()
  findAllCountries() {
    return this.countriesService.findAll();
  }


  @Public()
  @Get(':id')
  findCountry(@Param('id') id: string) {
    return this.countriesService.findOneCountry(id);
  }


  @Public()
  @Get(':id/cities')
  getCitiesFromCountry(@Param('id') id:string){
     return this.countriesService.findCitiesFromCountry(id);
  }


  @Public()
  @Get(':id_country/cities/:id_city')
  getCity(@Param('id_country') id_country:string,@Param('id_city') id_city:string){
    return this.countriesService.findCity(id_country,id_city);
  }

}
