import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BookingModeService } from './booking-mode.service';
import { CreateBookingModeDto } from './dto/create-booking-mode.dto';
import { UpdateBookingModeDto } from './dto/update-booking-mode.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('booking-mode')
export class BookingModeController {
  constructor(private readonly bookingModeService: BookingModeService) {}

  @Public()
  @Post()
  create(@Body() createBookingModeDto: CreateBookingModeDto) {
    return this.bookingModeService.create(createBookingModeDto);
  }

  @Get()
  findAll() {
    return this.bookingModeService.findAll();
  }

}
