import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AmenitiesService } from './amenities.service';
import { Public } from 'src/auth/decorators/public.decorator';


@Controller('amenities')
export class AmenitiesController {
  constructor(private readonly amenitiesService: AmenitiesService) {}


  @Public()
  @Post()
  create() {
    return this.amenitiesService.create();
  }

  @Public()
  @Get()
  findAll() {
    return this.amenitiesService.findAll();
  }

  

}
