import { Controller, Get, Post, Body } from '@nestjs/common';
import { BookingModeService } from './booking-mode.service';
import { CreateBookingModeDto } from './dto/create-booking-mode.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import {ApiTags,ApiOperation,ApiResponse,ApiBody,} from '@nestjs/swagger';


@ApiTags('Booking Modes')
@Controller('booking-mode') 
export class BookingModeController {
  constructor(private readonly bookingModeService: BookingModeService) {}

  @Post()
  //@Role(Roles.ADMIN) // web master role.
  @ApiOperation({ summary: 'Create a booking mode' })
  @ApiBody({ type: CreateBookingModeDto })
  @ApiResponse({ status: 201, description: 'Booking mode created' })
  create(@Body() createBookingModeDto: CreateBookingModeDto) {
    return this.bookingModeService.create(createBookingModeDto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all booking modes' })
  @ApiResponse({ status: 200, description: 'List of booking modes' })
  getBookingModes() {
    return this.bookingModeService.findAll();
  }
}