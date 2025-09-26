import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import {countries} from './data/countries';
import { Country } from './entities/country.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from './entities/city.entity';

@Injectable()
export class CountriesService {

  constructor(@InjectRepository(Country) private readonly countryRepositry:Repository<Country>,
              @InjectRepository(City) private readonly cityRepository:Repository<City>
  ){

  }


 async insertCountriesAndCities() {
  const existCountry = await this.countryRepositry.count();
  if(existCountry>0){
    throw new BadRequestException('Countries already exist');
  }
  for (const country of countries) {
    const { cities, name, country_code } = country;
    const countrySaved = await this.countryRepositry.save({ name, country_code });

    for (const city of cities) {
      const { name: cityName } = city;
      await this.cityRepository.save({
        name: cityName,
        country: countrySaved 
      });
    }
  }
}


  findAll() {
   return countries;
   
  }

  findOne(id: number){
    return countries;
  }

  update(id: number, updateCountryDto: UpdateCountryDto) {
    return `This action updates a #${id} country`;
  }

  remove(id: number) {
    return `This action removes a #${id} country`;
  }
}
