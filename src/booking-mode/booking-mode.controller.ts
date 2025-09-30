import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BookingModeService } from './booking-mode.service';
import { CreateBookingModeDto } from './dto/create-booking-mode.dto';
import { UpdateBookingModeDto } from './dto/update-booking-mode.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { Role } from 'src/auth/decorators/role.decorator';

@Controller('booking-mode')
export class BookingModeController {
  constructor(private readonly bookingModeService: BookingModeService) {}

  @Role('super-admin')
  @Post()
  create(@Body() createBookingModeDto: CreateBookingModeDto) {
    return this.bookingModeService.create(createBookingModeDto);
  }


  @Public()
  @Get()
  getBookinModes(){
    return this.bookingModeService.findAll();
  }



  



}
