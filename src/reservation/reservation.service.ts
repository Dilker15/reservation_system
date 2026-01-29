
import { BadRequestException, forwardRef, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { PlacesService } from 'src/places/places.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { Repository, DataSource } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { BookingStrategyFactory } from './strategies/BookingStrategyFactory';
import { PlaceResponseDto } from 'src/places/dto/place.response.dto';
import { BookingModeType, RESERVATION_STATUS } from 'src/common/Interfaces';
import { cli } from 'winston/lib/winston/config';
import { join } from 'path';
import { Place } from 'src/places/entities/place.entity';

@Injectable()
export class ReservationService {
  constructor(
    @Inject(forwardRef(() => PlacesService))
    private readonly placeService: PlacesService,

    @InjectRepository(Reservation)
    private readonly reservationRepo: Repository<Reservation>,

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
         message: `Reserva creada exitosamente.
                  Por favor, procede con el pago para confirmar tu reserva.
                  Ten en cuenta: tu reserva se mantendrá activa solo durante 10 minutos.
                  Si el pago no se completa dentro de este tiempo, la reserva se liberará automáticamente.`,
         reservationId: saved.id
       };
     });
     return transacctionCreated;
   } catch (err) {
     if (err?.response || err?.status) throw err;
      console.error(err);
     throw new InternalServerErrorException('Internal server error while creating reservation.');
   }
 }




 async reservationIsPaid(reservation_id:string):Promise<boolean>{
     const reservation = await this.reservationRepo.findOneBy({id:reservation_id,status:RESERVATION_STATUS.PAID});
     return !!reservation;
 }

  async findOne(id: string) {
    try{
      const reservation = await this.reservationRepo
      .createQueryBuilder("r")
      .leftJoin("r.place", "p")
      .leftJoin("p.images", "pi")
      .leftJoin("p.owner", "o")
      .leftJoin("o.payment_accounts", "pa")

      .select([
        "r.id",
        "r.status",
        "r.reservation_start_date",
        "r.start_time",
        "r.end_time",
        "r.total_price",
        "r.amount",

        
        "p.id",
        "p.name",
        "p.address",
        "p.price",
        "p.description",

        "pi.url",

        "o.id",

        "pa.id",
        "pa.provider",
        "pa.status",
      ])
      .where("r.id = :id", { id })
      .getOne();
      return reservation;
    }catch(error){
        throw new NotFoundException(`Reservation not found with id: ${id}`);
    
    }
 
  }


   async getAvailabilityDaily(placeId: string, date: string) {
 
    return this.dataSource
      .createQueryBuilder(Reservation, 'reservation')
      .select([
        'reservation.start_time AS reservation_start_time',
        'reservation.end_time AS reservation_end_time',
        'reservation.amount AS reservation_amount',
        "reservation.reservation_start_date::text AS reservation_start_date",
      ])
      .where('reservation.place_id = :placeId', { placeId })
      .andWhere('reservation.status IN (:...statuses)', {
        statuses: [
          RESERVATION_STATUS.CREATED,
          RESERVATION_STATUS.PAID,
        ],
      })
      .andWhere('reservation.reservation_start_date = :date', {
        date,
      })
      .orderBy('reservation.start_time', 'ASC')
      .getRawMany();
  }



  async getAllClientReservation(client:User){

  }
  

  
  
  
 }
