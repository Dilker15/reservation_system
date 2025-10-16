import { Module } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { CountriesController } from './countries.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Country } from './entities/country.entity';
import { City } from './entities/city.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Country,City])],
  controllers: [CountriesController],
  providers: [CountriesService],
  exports:[TypeOrmModule.forFeature([Country, City])]
})
export class CountriesModule {}
