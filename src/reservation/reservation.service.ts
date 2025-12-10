// src/reservations/reservation.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { PlacesService } from 'src/places/places.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { Repository, DataSource } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { BookingStrategyFactory } from './strategies/BookingStrategyFactory';
import { PlaceResponseDto } from 'src/places/dto/place.response.dto';
import { BookingModeType, RESERVATION_STATUS } from 'src/common/Interfaces';

@Injectable()
export class ReservationService {
  constructor(
    private readonly placeService: PlacesService,
    @InjectRepository(Reservation) private readonly reservationRepo: Repository<Reservation>,
    private readonly dataSource: DataSource,
    private readonly strategyFactory: BookingStrategyFactory,
  ) {}



  async create(dto: CreateReservationDto, client: User) {
    const place = await this.placeService.findOne(dto.place_id);
    const type: BookingModeType = place.booking_mode.type as BookingModeType;

    const strategy = this.strategyFactory.getStrategy(type);

    
    strategy.validateDto(dto);
    strategy.validateBusiness(place as PlaceResponseDto, dto);

    let transacctionCreated;
    try {
      transacctionCreated = await this.dataSource.transaction(async (manager) => {
        await strategy.ensureAvailability(dto, manager);

        const amount = strategy.calculateAmount(dto);

        const reservationEntity = strategy.buildReservation(dto, place.id, client, amount,place.price);
        reservationEntity.status = RESERVATION_STATUS.CREATED;
        const repo = manager.getRepository(Reservation);
        const saved = await repo.save(reservationEntity);
        
        return {
          message: `Reservation successfully created. Please proceed with the payment to confirm your booking.
                    Please note: your reservation will be held for only 10 minutes.
                    If payment is not completed within this time, it will be automatically released`,
          reservation: saved,
        };
      });
      delete transacctionCreated['reservation']['user'];
      return transacctionCreated;
    } catch (err) {
      if (err?.response || err?.status) throw err;
       console.error(err);
      throw new InternalServerErrorException('Internal server error while creating reservation.');
    }
  }
}

