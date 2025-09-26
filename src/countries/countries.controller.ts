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
  //@Role('super-admin')  JUST FOR ADMIN PANEL
  create() {
    return this.countriesService.insertCountriesAndCities();
  }

  @Public()
  @Get()
  findAll() {
    return this.countriesService.findAll();
  }

}
