import { Controller, Get, Post, Param } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { Role } from 'src/auth/decorators/role.decorator';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Countries')
@Controller('countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Seed countries and cities' })
  @ApiResponse({ status: 201, description: 'Countries seeded successfully' })
  create() {
    return this.countriesService.insertCountriesAndCities();
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all countries' })
  @ApiResponse({ status: 200, description: 'List of countries' })
  findAllCountries() {
    return this.countriesService.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a country by ID' })
  @ApiParam({ name: 'id', example: 'uuid' })
  @ApiResponse({ status: 200, description: 'Country found' })
  findCountry(@Param('id') id: string) {
    return this.countriesService.findOneCountry(id);
  }

  @Public()
  @Get(':id/cities')
  @ApiOperation({ summary: 'Get cities from a country' })
  @ApiParam({ name: 'id', example: 'uuid' })
  @ApiResponse({ status: 200, description: 'List of cities' })
  getCitiesFromCountry(@Param('id') id: string) {
    return this.countriesService.findCitiesFromCountry(id);
  }

  @Public()
  @Get(':id_country/cities/:id_city')
  @ApiOperation({ summary: 'Get a specific city from a country' })
  @ApiParam({ name: 'id_country', example: 'uuid' })
  @ApiParam({ name: 'id_city', example: 'uuid' })
  @ApiResponse({ status: 200, description: 'City found' })
  getCity(
    @Param('id_country') id_country: string,
    @Param('id_city') id_city: string,
  ) {
    return this.countriesService.findCity(id_country, id_city);
  }
}