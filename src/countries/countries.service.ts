import { BadRequestException, Injectable } from '@nestjs/common';
import {countries} from './data/countries';
import { Country } from './entities/country.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from './entities/city.entity';
import { CountryResponseDto } from './dto/country-response';
import { plainToInstance } from 'class-transformer';

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

  async findAll() {
    const countries = await this.countryRepositry.find({
      where: { is_active: true },
    });
    return this.parseCountryResponse(countries);
  }


  async findOneCountry(id:string){
    const country = await this.countryRepositry.findOne({
      where: { id, is_active: true },
    });
    if(!country){
       throw new BadRequestException("Country not Found");
    }
    return this.parseCountryResponse(country);
  }


  async findCitiesFromCountry(countryId: string) {
    const country = await this.countryRepositry
      .createQueryBuilder('country')
      .leftJoinAndSelect(
        'country.cities',
        'city',
        'city.is_active = :active',
        { active: true },
      )
      .where('country.id = :countryId', { countryId })
      .andWhere('country.is_active = true')
      .getOne();
  
    if (!country) {
      throw new BadRequestException('Country not found');
    }
  
    return country;
  }
  
  
  async findCity(id_country: string, id_city: string) {
    const city = await this.cityRepository
      .createQueryBuilder('city')
      .innerJoinAndSelect('city.country', 'country')
      .where('city.id = :id_city', { id_city })
      .andWhere('city.is_active = true')
      .andWhere('country.id = :id_country', { id_country })
      .andWhere('country.is_active = true')
      .getOne();
  
    if (!city) {
      throw new BadRequestException('City not found or country is inactive');
    }
  
    return city;
  }
  


  private parseCountryResponse(data: Country | Country[]): CountryResponseDto | CountryResponseDto[] {
    return plainToInstance(CountryResponseDto, data, {
      excludeExtraneousValues: true,
    });
  }


}
