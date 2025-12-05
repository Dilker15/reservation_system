// src/reservations/strategies/hourly.strategy.ts
import { BookingStrategy } from './IBookingStrategy';
import { CreateReservationDto } from '../dto/create-reservation.dto';
import { PlaceResponseDto } from 'src/places/dto/place.response.dto';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { parseISO, isBefore, startOfDay } from 'date-fns';
import { stringToDateOnly,stringToTimeOnlyAsString } from '../utils/date.helpers';
import { RESERVATION_STATUS } from 'src/common/Interfaces';
import { Reservation } from '../entities/reservation.entity';

export class HourlyStrategy implements BookingStrategy {


  validateDto(dto: CreateReservationDto): void {
    const required = ['reservation_day','reservation_start_date','start_time','end_time','place_id'];
    const missing = required.filter(f => !dto[f]);
    if (missing.length) {
      throw new BadRequestException(`Missing fields for hourly reservation: ${missing.join(', ')}`);
    }
  }

  validateBusiness(place: PlaceResponseDto, dto: CreateReservationDto): void {
        const { reservation_day, start_time, end_time, reservation_start_date } = dto;

        const reservationDate = startOfDay(parseISO(reservation_start_date));
        const today = startOfDay(new Date());
        if (isBefore(reservationDate, today)) {
        throw new BadRequestException('Reservation date must be today or later.');
        }

        const schedule = place.opening_hours.find(d => d.day === reservation_day);
        if (!schedule) {
        throw new BadRequestException(`The day "${reservation_day}" is not available for booking.`);
        }

        const { open_time, close_time } = schedule;
        if (!(open_time <= start_time! && start_time! < end_time!&& end_time! <= close_time)) {
        throw new BadRequestException(`Invalid time range "${start_time}-${end_time}". Allowed window is "${open_time}-${close_time}".`);
        }
  }

  calculateAmount(dto: CreateReservationDto): number {
        const diff = this.timeDiffHours(dto.start_time!, dto.end_time!);
        if (diff < 1) {
         throw new BadRequestException('Reservation must be at least 1 hour.');
        }
        return diff;
  }

  private timeToMinutes(t: string): number {
        const [hh, mm] = t.split(':').map(Number);
        return hh * 60 + (mm || 0);
  }

  private timeDiffHours(start: string, end: string): number {
        const m1 = this.timeToMinutes(start);
        const m2 = this.timeToMinutes(end);
        const diff = (m2 - m1) / 60;
        return diff;
  }

  async ensureAvailability(dto: CreateReservationDto, manager: EntityManager): Promise<void> {
        const repo = manager.getRepository(Reservation);
        const overlaps = await repo.createQueryBuilder('r')
        .where('r.place_id = :placeId', { placeId: dto.place_id })
        .andWhere('r.status IN (:...statuses)', { statuses: [RESERVATION_STATUS.IN_PROGRESS, RESERVATION_STATUS.CREATED, RESERVATION_STATUS.PAID] })
        .andWhere('r.start_time < :endTime AND r.end_time > :startTime', { startTime: stringToTimeOnlyAsString(dto.start_time!), endTime: stringToTimeOnlyAsString(dto.end_time!) })
        .andWhere('r.reservation_start_date = :reservationDate', { reservationDate: stringToDateOnly(dto.reservation_start_date) })
        .setLock('pessimistic_write')
        .getMany();

        if (overlaps.length > 0) {
         throw new ConflictException({ message: 'The selected time slot is not available' });
        }
  }

  buildReservation(dto: CreateReservationDto, placeId: string, user: User, amount: number,pricePlace:number): Reservation {
        const r = new Reservation();
        r.amount = amount;

        r.start_time = stringToTimeOnlyAsString(dto.start_time!);
        r.end_time = stringToTimeOnlyAsString(dto.end_time!);

        r.reservation_start_date = stringToDateOnly(dto.reservation_start_date);
        r.reservation_end_date = stringToDateOnly(dto.reservation_start_date);
        r.total_price = amount * pricePlace;
        r.place = { id: placeId } as any;
        r.user = user;
        r.status = RESERVATION_STATUS.CREATED;

        return r;
  }
}
