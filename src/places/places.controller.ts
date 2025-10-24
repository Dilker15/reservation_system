import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, Query, ParseUUIDPipe, Put } from '@nestjs/common';
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
  @Get('/me')
  async getPlacesOwner(@GetUser() owner:User){
      return this.placesService.getMyPlaces(owner);
  }



  @Role(Roles.OWNER)
  @Patch(":place_id")
  updatePlace(@Body() updateDto:UpdatePlaceDto,@Param('place_id',ParseUUIDPipe) place_id:string,@GetUser() owner:User){
    return this.placesService.updateBasicInformation(updateDto,place_id,owner);
  }
  


  @UseInterceptors(ImageUploadInterceptor('imagesToUpdate'))
  @Role(Roles.OWNER)
  @Patch(':place_id/images')
  async updatePlacesImages(@Param('place_id',ParseUUIDPipe) place_id:string,@GetUser() owner:User,@UploadedFiles() imagesToUpdate:Express.Multer.File[]){
    const imagesRoutes = await this.imageLocalService.saveImagesToDisk(imagesToUpdate);
    return this.placesService.updateImages(place_id,owner,imagesRoutes);
  }



  @Role(Roles.OWNER)
  @Patch(':place_id/category')
  updatePlaceCategory(@Param('place_id',ParseUUIDPipe) place_id:string,@Body('category_id',ParseUUIDPipe) category_id:string,@GetUser() owner:User){
    return this.placesService.updateCategory(place_id,category_id,owner);
  }




  @Role(Roles.OWNER)
  @Patch(":place_id/booking_mode/")
  updatePlaceBookingMode(@Param('place_id',ParseUUIDPipe) place_id:string,@Body('booking_mode_id',ParseUUIDPipe) booking_mode_id:string,@GetUser() owner:User){
    return this.placesService.updateBookingMode(place_id,booking_mode_id,owner)
  }


  @Role(Roles.OWNER)
  @Patch(":place_id/location/")
  updatePlaceLocation(@Body('city_id',ParseUUIDPipe) city_id:string,@GetUser() owner:User){

  }











}
