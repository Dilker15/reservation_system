import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { User } from 'src/users/entities/user.entity';
import { GetClient } from 'src/auth/decorators/getClient';
import { GetUser } from 'src/auth/decorators/getUser.decorator';
import { Role } from 'src/auth/decorators/role.decorator';
import { Roles } from 'src/common/Interfaces';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { QueryReservationDto } from './dto/queryReservation.dto';



@Controller('reservation')
export class ReservationController {

  constructor(private readonly reservationService: ReservationService) {}

  @Role(Roles.CLIENT)
  @Post()
  create(@Body() createReservationDto: CreateReservationDto,@GetClient() client: User) {
    return this.reservationService.create(createReservationDto, client);
  }


  @Role(Roles.CLIENT,Roles.OWNER)
  @Get()
  getReservations(@GetUser() user:User,@Query() pagination:QueryReservationDto){
    return this.reservationService.getReservationsList(user,pagination)
  }


  @Role(Roles.CLIENT)
  @Get(':id/payment')
  getReservationPaymentInfo(@Param('id', ParseUUIDPipe) id: string,@GetUser() currentUser:User) {
     return this.reservationService.getPaymentInfo(id,currentUser);
  }


  @Role(Roles.OWNER,Roles.CLIENT)
  @Get(':id')
  getReservation(@Param('id',ParseUUIDPipe) reseravtion_id:string,@GetUser() currenUser:User){
    return this.reservationService.getReservationById(reseravtion_id,currenUser);
  }


  @Role(Roles.OWNER,Roles.CLIENT)
  @Patch(':id/cancel')
  cancelReservation(@Param('id',ParseUUIDPipe) id_reservation:string,@GetUser() currentUser:User){
    return this.reservationService.cancelReservation(id_reservation,currentUser);
  }

  
}