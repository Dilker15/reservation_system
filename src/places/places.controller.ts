import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { PlacesService } from './places.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { Role } from 'src/auth/decorators/role.decorator';
import { Roles } from 'src/common/Interfaces';
import { ImageUploadInterceptor } from 'src/common/interceptors/response/images.place.interceptor';
import { ImageLocalService } from 'src/common/helpers/imageLocalService';


@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService,private readonly imageLocalService:ImageLocalService) {}

  @UseInterceptors(ImageUploadInterceptor('images'))
  @Role(Roles.OWNER)
  @Post()
  async create(@Body() createPlaceDto: CreatePlaceDto,@UploadedFiles() images:Express.Multer.File[]) {
    const routeImages = await this.imageLocalService.saveImagesToDisk(images);
    return this.placesService.create(createPlaceDto,routeImages);
  }



  @Get()
  findAll() {
    return this.placesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.placesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlaceDto: UpdatePlaceDto) {
    return this.placesService.update(+id, updatePlaceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.placesService.remove(+id);
  }


 


}
