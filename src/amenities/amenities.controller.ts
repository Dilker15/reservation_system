import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AmenitiesService } from './amenities.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';


@Controller('amenities')
export class AmenitiesController {
  constructor(private readonly amenitiesService: AmenitiesService) {}


  @ApiOperation({ summary: 'create amenities' })
  @ApiResponse({ status: 201,description:'create amenities' })
  @Public()
  @Post()
  create() {
    return this.amenitiesService.create();
  }

  @ApiOperation({ summary: 'Get all amenities' })
  @ApiResponse({ status: 200, description: 'List of amenities availables' })
  @Public()
  @Get()
  findAll() {
    return this.amenitiesService.findAll();
  }

  

}
