
import { BookingStrategy } from './IBookingStrategy';
import { CreateReservationDto } from '../dto/create-reservation.dto';
import { PlaceResponseDto } from 'src/places/dto/place.response.dto';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Reservation } from '../entities/reservation.entity';
import { User } from 'src/users/entities/user.entity';
import { parseISO, differenceInDays, startOfDay, isBefore } from 'date-fns';
import { stringToDateOnly,stringToTimeOnlyAsString } from '../utils/date.helpers';
import { BookingModeType, RESERVATION_STATUS } from 'src/common/Interfaces';

export class RangeStrategy implements BookingStrategy {
  constructor(private readonly type: BookingModeType) {}

  validateDto(dto: CreateReservationDto): void {
    const required = ['reservation_start_date','reservation_end_date','place_id'];
    const missing = required.filter(f => !dto[f]);
    if (missing.length) {
      throw new BadRequestException(`Missing fields for ${this.type} reservation: ${missing.join(', ')}`);
    }
  }

  validateBusiness(place: PlaceResponseDto, dto: CreateReservationDto): void {
        const { reservation_start_date, reservation_end_date } = dto;
        const start = startOfDay(parseISO(reservation_start_date));
        const end = startOfDay(parseISO(reservation_end_date!));
        const today = startOfDay(new Date());

        if (isBefore(start, today)) {
         throw new BadRequestException('Reservation date must be today or later.');
        }
        if (isBefore(end, start)) {
         throw new BadRequestException('End date must be after start date.');
        }

        const rangeDay = this.type === BookingModeType.WEEKLY ? 7 : 30;
        const diffDays = differenceInDays(end, start);
        if (diffDays < 1) {
         throw new BadRequestException(`Reservation must be at least 1 ${this.type}`);
        }

        if (diffDays % rangeDay !== 0) {
         throw new BadRequestException(`Reservation duration must be in full ${this.type} units (multiples of ${rangeDay} days).`);
        }
  }

  calculateAmount(dto: CreateReservationDto): number {
    const start = parseISO(dto.reservation_start_date);
    const end = parseISO(dto.reservation_end_date!);
    const diffDays = differenceInDays(end, start);
    const rangeDay = this.type === BookingModeType.WEEKLY ? 7 : 30;
    return diffDays / rangeDay;
  }

  async ensureAvailability(dto: CreateReservationDto, manager: EntityManager): Promise<void> {
    const repo = manager.getRepository(Reservation);
    const overlaps = await repo.createQueryBuilder('r')
      .where('r.place_id = :placeId', { placeId: dto.place_id })
      .andWhere('r.status IN (:...statuses)', { statuses: [RESERVATION_STATUS.IN_PROGRESS, RESERVATION_STATUS.CREATED, RESERVATION_STATUS.PAID] })
      .andWhere('r.reservation_start_date <= :endDate AND r.reservation_end_date >= :startDate', { startDate: stringToDateOnly(dto.reservation_start_date), endDate: stringToDateOnly(dto.reservation_end_date!) })
      .setLock('pessimistic_write')
      .getMany();

    if (overlaps.length > 0) {
      throw new ConflictException({ message: 'The selected time slot is not available' });
    }
  }

  buildReservation(dto: CreateReservationDto, placeId: string, user: User, amount: number,pricePlace:number): Reservation {
    const r = new Reservation();
    r.amount = amount;

    r.start_time = stringToTimeOnlyAsString(dto.start_time);
    r.end_time = stringToTimeOnlyAsString(dto.end_time);

    r.reservation_start_date = stringToDateOnly(dto.reservation_start_date);
    r.reservation_end_date = stringToDateOnly(dto.reservation_end_date!);
    
    r.total_price = amount * pricePlace;
    r.place = { id: placeId } as any;
    r.user = user;
    r.status = RESERVATION_STATUS.CREATED;

    return r;
  }
}
