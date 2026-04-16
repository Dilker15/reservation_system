import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseUUIDPipe,
  Query,
  UseInterceptors
} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { User } from 'src/users/entities/user.entity';
import { GetClient } from 'src/auth/decorators/getClient';
import { GetUser } from 'src/auth/decorators/getUser.decorator';
import { Role } from 'src/auth/decorators/role.decorator';
import { Roles } from 'src/common/Interfaces';
import { QueryReservationDto } from './dto/queryReservation.dto';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery
} from '@nestjs/swagger';
import { IdempotencyInterceptor } from 'src/common/interceptors/idempotency.interceptor';

@ApiTags('Reservations')
@ApiBearerAuth()
@Controller('reservation')
export class ReservationController {

  constructor(private readonly reservationService: ReservationService) {}

  @UseInterceptors(IdempotencyInterceptor)
  @ApiOperation({ summary: 'Create a reservation (CLIENT)' })
  @Role(Roles.CLIENT)
  @Post()
  create(
    @Body() createReservationDto: CreateReservationDto,
    @GetClient() client: User
  ) {
    return this.reservationService.create(createReservationDto, client);
  }

  @ApiOperation({ summary: 'Get reservations list (CLIENT | OWNER)' })
  @ApiQuery({ type: QueryReservationDto })
  @Role(Roles.CLIENT, Roles.OWNER)
  @Get()
  getReservations(
    @GetUser() user: User,
    @Query() pagination: QueryReservationDto
  ) {
    return this.reservationService.getReservationsList(user, pagination);
  }

  @ApiOperation({ summary: 'Get payment info for a reservation' })
  @ApiParam({ name: 'id', example: '550e8400-e29b-41d4-a716-446655440000' })
  @Role(Roles.CLIENT)
  @Get(':id/payment')
  getReservationPaymentInfo(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() currentUser: User
  ) {
    return this.reservationService.getPaymentInfo(id, currentUser);
  }

  @ApiOperation({ summary: 'Get reservation by ID (CLIENT | OWNER)' })
  @ApiParam({ name: 'id', example: '550e8400-e29b-41d4-a716-446655440000' })
  @Role(Roles.OWNER, Roles.CLIENT)
  @Get(':id')
  getReservation(
    @Param('id', ParseUUIDPipe) reseravtion_id: string,
    @GetUser() currenUser: User
  ) {
    return this.reservationService.getReservationById(reseravtion_id, currenUser);
  }

  @UseInterceptors(IdempotencyInterceptor)
  @ApiOperation({ summary: 'Cancel a reservation' })
  @ApiParam({ name: 'id', example: '550e8400-e29b-41d4-a716-446655440000' })
  @Role(Roles.OWNER, Roles.CLIENT)
  @Patch(':id/cancel')
  cancelReservation(
    @Param('id', ParseUUIDPipe) id_reservation: string,
    @GetUser() currentUser: User
  ) {
    return this.reservationService.cancelReservation(id_reservation, currentUser);
  }

}