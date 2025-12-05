import { Module } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { PlacesModule } from 'src/places/places.module';
import { BookingStrategyFactory } from './strategies/BookingStrategyFactory';

@Module({
  imports:[TypeOrmModule.forFeature([Reservation]),PlacesModule],
  controllers: [ReservationController],
  providers: [ReservationService,BookingStrategyFactory],
})
export class ReservationModule {}
