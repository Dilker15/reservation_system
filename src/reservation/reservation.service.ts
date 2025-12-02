
import { BadRequestException, ConflictException, HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { PlacesService } from 'src/places/places.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import {Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { BookingModeType, RESERVATION_STATUS } from 'src/common/Interfaces';
import { SelectQueryBuilder } from 'typeorm/browser';

import { PlaceResponseDto } from 'src/places/dto/place.response.dto';
import { DataSource } from "typeorm"; 


@Injectable()
export class ReservationService {

  
  constructor(private readonly placeService:PlacesService,@InjectRepository(Reservation) private readonly reservationRepo:Repository<Reservation>,
              private readonly dataSource:DataSource,
){
  }



  async create(createReservationDto: CreateReservationDto, client: User) {
    const { place_id,} = createReservationDto;
    const placeFound = await this.placeService.findOne(place_id); 
    this.validateBookingTypeFromDto(placeFound.booking_mode.type,createReservationDto);
    //this.validateDataFromDto(placeFound.booking_mode.type,createReservationDto);
    const reservationDate = new Date(`${createReservationDto.reservation_start_date}T00:00:00`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    
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
        
        return {
          message: "Reservation successfully created. Please proceed with payment to confirm your booking.",
          //reservation,
        };
      } catch (error) {
        if (error instanceof HttpException) {
          throw error;
        }
        console.log(error);
        throw new InternalServerErrorException("Internal server error while creating reservation.");
      }
  }



    private validateBookingTypeFromDto(bookinType:string,dto: CreateReservationDto):void{
    
      switch (bookinType) {
        case BookingModeType.HOURLY:
          this.validateHourlyReservationDto(dto);
          return;
    
        case BookingModeType.WEEKLY:
          this.validateWeeklyReservationDto(dto);
          return;
    
        case BookingModeType.MONTHLY:
          this.validateMonthlyReservationDto(dto);
          return;
    
        default:
          throw new BadRequestException(
            `Unsupported booking mode type: ${bookinType}`
          );
      }
    }
    


  private validateDayliDataFromDto(bookingType:string,data:CreateReservationDto):void{
      
      switch(bookingType){
          case BookingModeType.DAILY:
            
            return;
          
          case BookingModeType.WEEKLY:
            return;

          case BookingModeType.MONTHLY:
            return;
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
                                            .andWhere("r.reservation_start_date = :reservationDate", { reservationDate })
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



  private validateDayAndHours(place: PlaceResponseDto,day: number,start_time: string,end_time: string):void {
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


  private validateHourlyReservationDto(data: CreateReservationDto): void {
    this.ensureFields(data,['reservation_day','reservation_start_date', 'start_time', 'end_time','quantity'],'Hourly reservation');

  }


  private validateWeeklyReservationDto(data: CreateReservationDto): void {
    this.ensureFields(data,['reservation_start_date', 'reservation_end_date', 'place_id', 'quantity'],'Weekly reservation');
  }


  private validateMonthlyReservationDto(data: CreateReservationDto): void {
    this.ensureFields(data,['reservation_start_date', 'reservation_end_date', 'place_id', 'quantity'],'Monthly reservation');
  }
  
  


  private ensureFields(data: CreateReservationDto, requiredFields: string[], context: string): void {
    const missing = requiredFields.filter(field => !data[field]);
    if (missing.length > 0) {
        throw new BadRequestException(
            `Invalid ${context}. Missing fields: ${missing.join(', ')}`
        );
    }
  }

  



  
}

