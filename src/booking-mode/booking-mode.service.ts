import { Injectable } from '@nestjs/common';
import { CreateBookingModeDto } from './dto/create-booking-mode.dto';

@Injectable()
export class BookingModeService {
  create(createBookingModeDto: CreateBookingModeDto) {
    return createBookingModeDto;
  }

  findAll() {
    return `This action returns all bookingMode`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bookingMode`;
  }

}
