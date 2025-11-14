import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { OpeningHoursService } from './opening-hours.service';
import { UpdateOpeningHourDto } from './dto/update-opening-hour.dto';
import { Role } from 'src/auth/decorators/role.decorator';
import { Roles } from 'src/common/Interfaces';
import { GetUser } from 'src/auth/decorators/getUser.decorator';
import { User } from 'src/users/entities/user.entity';

@Controller('opening-hours')
export class OpeningHoursController {
  constructor(private readonly openingHoursService: OpeningHoursService) {}


  @Role(Roles.OWNER)
  @Patch(':id')
  update(@Param('id',ParseUUIDPipe) id: string, @Body() updateOpeningHourDto: UpdateOpeningHourDto,@GetUser() owner:User) {
    return this.openingHoursService.update(id, updateOpeningHourDto,owner);
  }


  @Role(Roles.OWNER)
  @Delete(':id')
  remove(@Param('id',ParseUUIDPipe) hour_id:string,@Body('place_id',ParseUUIDPipe) place_id:string,@GetUser() owner:User){
    return this.openingHoursService.remove(hour_id,place_id,owner);
  }



}
