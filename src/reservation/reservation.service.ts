
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
    const {type} = placeFound.booking_mode;
    this.validateFields(type,createReservationDto);
    this.validateData(type,placeFound,createReservationDto);
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



    private validateFields(bookinType:string,dto: CreateReservationDto):void{
      switch (bookinType) {
        case BookingModeType.HOURLY:
          this.validateHourlyFieldsDto(dto);
          return;
    
        case BookingModeType.WEEKLY:
          this.validateWeeklyFieldsDto(dto);
          return;
    
        case BookingModeType.MONTHLY:
          this.validateMonthlyFieldsDto(dto);
          return;
    
        default:
          throw new BadRequestException(
            `Unsupported booking mode type field: ${bookinType}`
          );
      }
    }
    


    private validateData(bookingType:string,place:PlaceResponseDto,data:CreateReservationDto):void{
        
        switch(bookingType){
            case BookingModeType.HOURLY:
               this.validateHourlyInformation(place,data);
              return;
            case BookingModeType.WEEKLY:
              this.validateWeeklyInformation(place,data);
              return;

            case BookingModeType.MONTHLY:
              this.validateMonthlyInformation(place,data);
            return;
            default:
                throw new BadRequestException(
              `Unsupported booking mode type data: ${bookingType}`
            );
        }
    }



 

    private async validateHourlyInformation(place: PlaceResponseDto,data: CreateReservationDto): Promise<void> {
      const { reservation_day, start_time, end_time } = data;

      const schedule = place.opening_hours.find(
        (day) => day.day === reservation_day
      );

      if (!schedule) {
        throw new BadRequestException(
          `The day "${reservation_day}" is not available for booking.`
        );
      }

      const { open_time, close_time } = schedule;

      const openMin = this.parseTimeToMinutes(open_time);
      const startMin = this.parseTimeToMinutes(start_time!);
      const endMin = this.parseTimeToMinutes(end_time!);
      const closeMin = this.parseTimeToMinutes(close_time);

      console.log(openMin);
      console.log(startMin);
      console.log(endMin);
      console.log(closeMin);
      const isValidRange =openMin <= startMin && startMin < endMin &&endMin <= closeMin;

      if (!isValidRange) {
        throw new BadRequestException(
          `Invalid time range "${start_time}-${end_time}". Allowed window is "${open_time}-${close_time}".`
        );
      }
    }

  private async validateWeeklyInformation(place:PlaceResponseDto,data:CreateReservationDto):Promise<void>{

  }


  private async validateMonthlyInformation(place:PlaceResponseDto,date:CreateReservationDto):Promise<void>{

  }


  private validateHourlyFieldsDto(data: CreateReservationDto): void {
    this.ensureFields(data,['reservation_day','reservation_start_date', 'start_time', 'end_time','quantity'],'Hourly reservation');

  }


  private validateWeeklyFieldsDto(data: CreateReservationDto): void {
    this.ensureFields(data,['reservation_start_date', 'reservation_end_date', 'place_id', 'quantity'],'Weekly reservation');
  }


  private validateMonthlyFieldsDto(data: CreateReservationDto): void {
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

   private parseTimeToMinutes (time: string):number{
        if (!time) {
          throw new BadRequestException(`Invalid time format: "${time}".`);
        }

        const [h, m, s = "0"] = time.split(":");

        const hours = Number(h);
        const minutes = Number(m);
        const seconds = Number(s);

        if (Number.isNaN(hours) ||Number.isNaN(minutes) || Number.isNaN(seconds)) {
          throw new BadRequestException(`Invalid time format: "${time}".`);
        }

        return hours * 60 + minutes + seconds / 60;
  };



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




  
}

