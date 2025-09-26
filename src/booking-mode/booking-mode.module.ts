import { Module } from '@nestjs/common';
import { BookingModeService } from './booking-mode.service';
import { BookingModeController } from './booking-mode.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingMode } from './entities/booking-mode.entity';

@Module({
  imports:[TypeOrmModule.forFeature([BookingMode])],
  controllers: [BookingModeController],
  providers: [BookingModeService],
})
export class BookingModeModule {}
