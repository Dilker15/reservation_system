
// src/reservations/strategies/booking-strategy.factory.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { BookingModeType } from 'src/common/Interfaces';
import { BookingStrategy } from './IBookingStrategy';
import { HourlyStrategy } from './HourlyStrategy';
import { RangeStrategy } from './RangeStragety';


@Injectable()
export class BookingStrategyFactory {

  
  getStrategy(type: BookingModeType): BookingStrategy {
    switch (type) {
      case BookingModeType.HOURLY:
        return new HourlyStrategy();
      case BookingModeType.WEEKLY:
        return new RangeStrategy(BookingModeType.WEEKLY);
      case BookingModeType.MONTHLY:
        return new RangeStrategy(BookingModeType.MONTHLY);
      default:
        throw new BadRequestException(`Unsupported booking mode: ${type}`);
    }
  }
}
