import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { User } from 'src/users/entities/user.entity';
import { GetClient } from 'src/auth/decorators/getClient';
import { GetUser } from 'src/auth/decorators/getUser.decorator';
import { Role } from 'src/auth/decorators/role.decorator';
import { Roles } from 'src/common/Interfaces';

@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}



  @Role(Roles.CLIENT)
  @Post()
  create(@Body() createReservationDto: CreateReservationDto,@GetUser() client:User) {
    return this.reservationService.create(createReservationDto,client);
  }

 
}
