import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, Query, ParseUUIDPipe } from '@nestjs/common';
import { PlacesService } from './places.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { Role } from 'src/auth/decorators/role.decorator';
import { Roles } from 'src/common/Interfaces';
import { ImageUploadInterceptor } from 'src/common/interceptors/response/images.place.interceptor';
import { ImageLocalService } from 'src/common/helpers/imageLocalService';
import { GetUser } from 'src/auth/decorators/getUser.decorator';
import { User } from 'src/users/entities/user.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { PlaceResponseDto } from './dto/place.response.dto';


@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService,private readonly imageLocalService:ImageLocalService) {}

  @UseInterceptors(ImageUploadInterceptor('images'))
  @Role(Roles.OWNER)
  @Post()
  async create(@Body() createPlaceDto: CreatePlaceDto,@UploadedFiles() images:Express.Multer.File[],@GetUser() currentUser:User) {
    const routeImages = await this.imageLocalService.saveImagesToDisk(images);
    return this.placesService.create(createPlaceDto,routeImages,currentUser);
  }

  @Public()
  @Get()
  findAll(@Query() paginationDto:PaginationDto) {
    return this.placesService.findAll(paginationDto);
  }


  @Public()
  @Get(':id')
  async findOne(@Param('id',ParseUUIDPipe) placeId:string):Promise<PlaceResponseDto>{
     return this.placesService.findOne(placeId);
  }

  @Role(Roles.OWNER)
  @Get('/owners/me/')
  async getPlacesOwner(@GetUser() owner:User){
      return this.placesService.getMyPlaces(owner);
  }











}
