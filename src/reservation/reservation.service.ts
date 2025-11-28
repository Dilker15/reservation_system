import { BadRequestException, ConflictException, HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { PlacesService } from 'src/places/places.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { In, LessThan, MoreThan, Not, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { RESERVATION_STATUS } from 'src/common/Interfaces';
import { Http } from 'winston/lib/winston/transports';
import { SelectQueryBuilder } from 'typeorm/browser';
import { Place } from 'src/places/entities/place.entity';
import { PlaceResponseDto } from 'src/places/dto/place.response.dto';

@Injectable()
export class ReservationService {

  
  constructor(private readonly placeService:PlacesService,@InjectRepository(Reservation) private readonly reservationRepo:Repository<Reservation>){
  }



  async create(createReservationDto: CreateReservationDto, client: User) {
    const { place_id, start_time, end_time } = createReservationDto;
    const place = await this.placeService.findOne(place_id);

    const reservationDate = new Date(`${createReservationDto.date_reservation}T00:00:00`);
    this.validateDayAndTimes(place,createReservationDto.reservation_day,start_time,end_time);

    try {
      const occupied = await this.getOverlappingReservations(createReservationDto, reservationDate);

          if (occupied.length > 0) {
            throw new ConflictException({
              message: "The selected time slot is not available.",
              conflicts: occupied.map(o => ({
                start_time: o.start_time,
                end_time: o.end_time,
              })),
            });
          }
          

        const amount = this.calculateHours(start_time, end_time);

        const reservation = this.reservationRepo.create({
            amount,
            created_on: new Date(),
            reservation_date: reservationDate,
            start_time,
            end_time,
            status: RESERVATION_STATUS.CREATED,
            place: { id: place_id },
            user: { id: client.id },
        });

        await this.reservationRepo.save(reservation);
        return {
          message: "Reservation successfully created. Please proceed with payment to confirm your booking.",
          reservation,
        };
      } catch (error) {
        if (error instanceof HttpException) {
          throw error;
        }
        throw new InternalServerErrorException("Internal server error while creating reservation.");
      }
  }




  private calculateHours(start: string, end: string): number {
      const [sH, sM] = start.split(":").map(Number);
      const [eH, eM] = end.split(":").map(Number);

      const startMinutes = sH * 60 + sM;
      const endMinutes = eH * 60 + eM;

      const diff = (endMinutes - startMinutes) / 60;

      if (diff < 1) {
        throw new BadRequestException("La reserva debe tener al menos 1 hora.");
      }

      return diff;
  }


  private generateQueryReservation(dataQuery:CreateReservationDto,reservationDate:Date):SelectQueryBuilder<Reservation>{
    
      const query = this.reservationRepo.createQueryBuilder("r")
                                            .where("r.place_id = :placeId", { placeId: dataQuery.place_id })
                                            .andWhere("r.reservation_date = :reservationDate", { reservationDate })
                                            .andWhere("r.status IN (:...statuses)", {
                                              statuses: [RESERVATION_STATUS.IN_PROGRESS,RESERVATION_STATUS.CREATED,RESERVATION_STATUS.PAID],
                                            })
                                            .andWhere(`r.start_time < :endTime AND r.end_time > :startTime`,{
                                                startTime: dataQuery.start_time,
                                                endTime: dataQuery.end_time,
                                              })
                                            .orderBy("r.start_time", "ASC")
     return query;
  }


  private async getOverlappingReservations(dataQuery: CreateReservationDto, reservationDate: Date): Promise<Reservation[]> {
    return await this.generateQueryReservation(dataQuery, reservationDate).getMany();
  }

  private validateDayAndTimes(place: PlaceResponseDto,day: number,start_time: string,end_time: string):void {

    const { opening_hours } = place;
    const schedule = opening_hours.find(h => h.day === day);

    if (!schedule) {
      throw new BadRequestException(`The day ${day} is not available for booking`);
    }
    const { open_time, close_time } = schedule;

    if (!(open_time <= start_time && start_time < end_time && end_time <= close_time)) {
      throw new BadRequestException(
        `The time range ${start_time}-${end_time} is outside the allowed hours: ${open_time}-${close_time}`
      );
    }
  }




  
}
