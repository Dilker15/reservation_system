import { forwardRef, Module } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { PlacesModule } from 'src/places/places.module';
import { BookingStrategyFactory } from './strategies/BookingStrategyFactory';
import { QueueBullModule } from 'src/queue-bull/queue-bull.module';

@Module({
  imports:[TypeOrmModule.forFeature([Reservation]),
           forwardRef(() => PlacesModule),
           forwardRef(() => QueueBullModule),
  ],
  controllers: [ReservationController],
  providers: [ReservationService,BookingStrategyFactory],
  exports:[ReservationService],
})
export class ReservationModule {}
