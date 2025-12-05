
import { CreateReservationDto } from '../dto/create-reservation.dto';
import { EntityManager } from 'typeorm';
import { PlaceResponseDto } from 'src/places/dto/place.response.dto';
import { Reservation } from '../entities/reservation.entity';
import { User } from 'src/users/entities/user.entity';


export interface BookingStrategy {
  validateDto(dto: CreateReservationDto): void;
  validateBusiness(place: PlaceResponseDto, dto: CreateReservationDto): void;
  calculateAmount(dto: CreateReservationDto): number;
  ensureAvailability(dto: CreateReservationDto, manager: EntityManager): Promise<void>;
  buildReservation(dto: CreateReservationDto, placeId: string, user: User, amount: number,pricePlace:number): Reservation;
}
