import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseInterceptors, UploadedFiles, Query, ParseUUIDPipe
} from '@nestjs/common';
import { PlacesService } from './places.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { Role } from 'src/auth/decorators/role.decorator';
import { Roles } from 'src/common/Interfaces';
import { ImageUploadInterceptor } from 'src/common/interceptors/response/images.place.interceptor';
import { ImageLocalService } from 'src/common/helpers/imageLocalService';
import { GetUser } from 'src/auth/decorators/getUser.decorator';
import { User } from 'src/users/entities/user.entity';
import { PlaceOwnerQueryDto, PlaceQueryDto } from './dto/placeQuery.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { UpdateLocationDto } from 'src/locations/dto/update.location.dto';
import { AvailabilityDto } from './dto/availability.dto';
import { ParseAndValidateJsonPipe } from 'src/common/pipes/ParseJson.pipe';
import { GetPlaceReservationsQueryDto } from './dto/place.reservation.dto';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes
} from '@nestjs/swagger';
import { IdempotencyInterceptor } from 'src/common/interceptors/idempotency.interceptor';

@ApiTags('Places')
@Controller('places')
export class PlacesController {

  constructor(
    private readonly placesService: PlacesService,
    private readonly imageLocalService: ImageLocalService
  ) {}

  @UseInterceptors(IdempotencyInterceptor)
  @UseInterceptors(ImageUploadInterceptor('images'))
  @Role(Roles.OWNER)
  @ApiBearerAuth()
  @Post('hourly')
  @ApiOperation({ summary: 'Create place with hourly availability' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Place created successfully' })
  async create(
    @Body('opening_hours', ParseAndValidateJsonPipe) opening_hours: AvailabilityDto[],
    @Body() createPlaceDto: Partial<CreatePlaceDto>,
    @UploadedFiles() images: Express.Multer.File[],
    @GetUser() currentUser: User
  ) {
    if (typeof createPlaceDto.opening_hours === 'string') {
      createPlaceDto.opening_hours = JSON.parse(createPlaceDto.opening_hours);

    }
    const routeImages = await this.imageLocalService.saveImagesToDisk(images);
    return this.placesService.create(createPlaceDto as CreatePlaceDto,routeImages, currentUser);
  }

  @UseInterceptors(IdempotencyInterceptor)
  @UseInterceptors(ImageUploadInterceptor('images'))
  @Role(Roles.OWNER)
  @ApiBearerAuth()
  @Post('range')
  @ApiOperation({ summary: 'Create place with range booking mode' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201 })
  async createRange(
    @Body() createPlaceDto: Partial<CreatePlaceDto>,
    @UploadedFiles() images: Express.Multer.File[],
    @GetUser() currentUser: User
  ) {
    if (typeof createPlaceDto.opening_hours === 'string') {
      createPlaceDto.opening_hours = JSON.parse(createPlaceDto.opening_hours);
    }
    const routeImages = await this.imageLocalService.saveImagesToDisk(images);
    return this.placesService.createRange(createPlaceDto as CreatePlaceDto, routeImages, currentUser);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all places' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  findAll(@Query() paginationDto: PlaceQueryDto) {
    return this.placesService.findAll(paginationDto);
  }

  @Role(Roles.OWNER)
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Get places for current owner' })
  getPlacesOwner(@GetUser() owner: User, @Query() pagination: PlaceOwnerQueryDto) {
    return this.placesService.getMyPlaces(owner, pagination);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get place by ID' })
  @ApiParam({ name: 'id', example: 'uuid' })
  findOne(@Param('id', ParseUUIDPipe) placeId: string) {
    return this.placesService.findOne(placeId);
  }

  @Role(Roles.OWNER)
  @ApiBearerAuth()
  @Patch(":place_id")
  @ApiOperation({ summary: 'Update basic place information' })
  @ApiParam({ name: 'place_id', example: 'uuid' })
  @ApiBody({ type: UpdatePlaceDto })
  updatePlace(
    @Body() updateDto: UpdatePlaceDto,
    @Param('place_id', ParseUUIDPipe) place_id: string,
    @GetUser() owner: User
  ) {
    return this.placesService.updateBasicInformation(updateDto, place_id, owner);
  }

  @UseInterceptors(ImageUploadInterceptor('imagesToUpdate'))
  @Role(Roles.OWNER)
  @ApiBearerAuth()
  @Patch(':place_id/images')
  @ApiOperation({ summary: 'Update place images' })
  @ApiParam({ name: 'place_id', example: 'uuid' })
  @ApiConsumes('multipart/form-data')
  async updatePlacesImages(
    @Param('place_id', ParseUUIDPipe) place_id: string,
    @GetUser() owner: User,
    @UploadedFiles() imagesToUpdate: Express.Multer.File[]
  ) {
    const imageRoutes = await this.imageLocalService.saveImagesToDisk(imagesToUpdate);
    return this.placesService.updateImages(place_id, owner, imageRoutes); 
  }

  @Role(Roles.OWNER)
  @ApiBearerAuth()
  @Patch(':place_id/category')
  @ApiOperation({ summary: 'Update place category' })
  @ApiParam({ name: 'place_id', example: 'uuid' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        category_id: { type: 'string', example: 'uuid' }
      }
    }
  })
  updatePlaceCategory(
    @Param('place_id', ParseUUIDPipe) place_id: string,
    @Body('category_id', ParseUUIDPipe) category_id: string,
    @GetUser() owner: User
  ) {
    return this.placesService.updateCategory(place_id, category_id, owner);
  }

  @Role(Roles.OWNER)
  @ApiBearerAuth()
  @Patch(":place_id/booking_mode/")
  @ApiOperation({ summary: 'Update booking mode' })
  @ApiParam({ name: 'place_id', example: 'uuid' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        booking_mode_id: { type: 'string', example: 'uuid' }
      }
    }
  })
  updatePlaceBookingMode(
    @Param('place_id', ParseUUIDPipe) place_id: string,
    @Body('booking_mode_id', ParseUUIDPipe) booking_mode_id: string,
    @GetUser() owner: User
  ) {
    return this.placesService.updateBookingMode(place_id, booking_mode_id, owner)
  }

  @Role(Roles.OWNER)
  @ApiBearerAuth()
  @Delete(":place_id/images/:image_id")
  @ApiOperation({ summary: 'Delete image from place' })
  @ApiParam({ name: 'place_id', example: 'uuid' })
  @ApiParam({ name: 'image_id', example: 'uuid' })
  deleteImageFromPlace(
    @Param('place_id', ParseUUIDPipe) place_id: string,
    @Param('image_id') image_id: string,
    @GetUser() owner: User
  ) {
    return this.placesService.deleteImage(place_id, image_id, owner);
  }

  @Role(Roles.OWNER)
  @ApiBearerAuth()
  @Patch(":place_id/location/")
  @ApiOperation({ summary: 'Update place location' })
  @ApiParam({ name: 'place_id', example: 'uuid' })
  @ApiBody({ type: UpdateLocationDto })
  updateLocation(
    @Param('place_id', ParseUUIDPipe) place_id: string,
    @Body() newLocation: UpdateLocationDto,
    @GetUser() owner: User
  ) {
    return this.placesService.updateLocation(place_id, newLocation, owner);
  }

  @Role(Roles.OWNER)
  @ApiBearerAuth()
  @Patch(":place_id/city")
  @ApiOperation({ summary: 'Update place city' })
  @ApiParam({ name: 'place_id', example: 'uuid' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        city_id: { type: 'string', example: 'uuid' }
      }
    }
  })
  updateCity(
    @Param('place_id', ParseUUIDPipe) place_id: string,
    @Body('city_id', ParseUUIDPipe) city_id: string,
    @GetUser() owner: User
  ) {
    return this.placesService.updateCity(place_id, city_id, owner);
  }

  @Public()
  @Get(':id/schedules/day')
  @ApiOperation({ summary: 'Get place schedule' })
  @ApiParam({ name: 'id', example: 'uuid' })
  getShedule(@Param('id', ParseUUIDPipe) place_id: string) {
    return this.placesService.getCalendar(place_id);
  }

  @Public()
  @Get(':id/reservations')
  @ApiOperation({ summary: 'Get reservations by date' })
  @ApiParam({ name: 'id', example: 'uuid' })
  @ApiQuery({ name: 'date', example: '2026-03-20' })
  getPlaceReservationsByDate(
    @Param('id') placeId: string,
    @Query() query: GetPlaceReservationsQueryDto,
  ) {
    return this.placesService.getReservationsByDate(placeId, query.date);
  }
}