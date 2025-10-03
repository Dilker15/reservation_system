import { BadRequestException, Injectable, Logger } from '@nestjs/common';
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
  const exist = await this.countryRepositry.count();
  if (exist > 0) {
    throw new BadRequestException('Countries already exist');
  }

  for (const country of countries) {
    const savedCountry = await this.insertCountry(country);
    await this.insertCities(savedCountry, country.cities);
  }
}

private async insertCountry(data: { name: string; country_code: string }) {
  return this.countryRepositry.save({
    name: data.name,
    country_code: data.country_code,
  });
}

private async insertCities(country: Country, cities: { name: string }[]) {
  const cityEntities = cities.map(city => ({
    name: city.name,
    country,
  }));
  await this.cityRepository.save(cityEntities);
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
