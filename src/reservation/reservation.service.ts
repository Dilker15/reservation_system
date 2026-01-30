
import { BadRequestException, forwardRef, Inject, Injectable, InternalServerErrorException, NotFoundException, NotImplementedException } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { PlacesService } from 'src/places/places.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { Repository, DataSource } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { BookingStrategyFactory } from './strategies/BookingStrategyFactory';
import { PlaceResponseDto } from 'src/places/dto/place.response.dto';
import { BookingModeType, RESERVATION_STATUS, Roles } from 'src/common/Interfaces';
import { QueryReservationDto } from './dto/queryReservation.dto';
import { SelectQueryBuilder } from 'typeorm/browser';


@Injectable()
export class ReservationService {
  private readonly messageReservation: string = `Reserva creada exitosamente Por favor, procede con el pago para confirmar tu reserva.
                  Ten en cuenta: tu reserva se mantendrá activa solo durante 10 minutos.
                  Si el pago no se completa dentro de este tiempo, la reserva se liberará automáticamente`
            
  private readonly roleHandlers: Record<Roles,(user: User, query: QueryReservationDto) => Promise<any>> = {
                  [Roles.CLIENT]: this.getAllReservationsClient.bind(this),
                  [Roles.OWNER]: this.getAllReservationsOwner.bind(this),
                };

  constructor(@Inject(forwardRef(() => PlacesService)) private readonly placeService: PlacesService,@InjectRepository(Reservation)
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
          message:this.messageReservation,
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



  async getReservationsList(user:User,query:QueryReservationDto){
     const handler = this.roleHandlers[user.role];
     if(!handler){
        throw new BadRequestException(`Role is not available: ${user.role}`);
     }
     return handler(user,query);
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
 
    return this.dataSource.createQueryBuilder(Reservation, 'reservation')
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



  private buildClientReservationQuery(client: User,query: QueryReservationDto): SelectQueryBuilder<Reservation> {
    const qb = this.buildBaseReservationQuery()
      .select([
        'res.id as id',
        '(res.amount * res.total_price) as total',
        'res.start_time as start',
        'res.end_time as end',
        'res.created_on as booked_at',
        'res.reservation_start_date as reservation_date',
        'res.status as status',
        'place.name as place_name',
        'bm.type as mode',
      ])
      .where('res.client_id = :clientId', { clientId: client.id });

    this.applyReservationFilters(qb, query);
    return qb;
  }


  private buildOwnerReservationQuery(owner: User,query: QueryReservationDto): SelectQueryBuilder<Reservation> {
    const qb = this.buildBaseReservationQuery()
      .innerJoin('res.user', 'client')
      .select([
        'res.id as id',
        '(res.amount * res.total_price) as total',
        'res.start_time as start',
        'res.end_time as end',
        'res.created_on as booked_at',
        'res.reservation_start_date as reservation_date',
        'res.status as status',
        'place.name as place_name',
        'bm.type as mode',
        'client.name as client',
      ])
      .where('place.owner_id = :ownerId', { ownerId: owner.id });

    this.applyReservationFilters(qb, query);
    return qb;
  }


  async getAllReservationsClient(client: User,query: QueryReservationDto) {
    const qb = this.buildClientReservationQuery(client, query);
    return this.paginateRaw(qb, query.page, query.limit);
  }

  async getAllReservationsOwner(owner: User,query: QueryReservationDto) {
    const qb = this.buildOwnerReservationQuery(owner, query);
    return this.paginateRaw(qb, query.page, query.limit);
  }


  async reservationIsPaid(reservation_id:string):Promise<boolean>{
    const reservation = await this.reservationRepo.findOneBy({id:reservation_id,status:RESERVATION_STATUS.PAID});
    return !!reservation;
  }
  
  
  private applyReservationFilters(qb: SelectQueryBuilder<Reservation>,query: QueryReservationDto) {
    if (query.from && query.to) {
      qb.andWhere('res.reservation_start_date BETWEEN :start AND :end',{start: query.from,end: query.to});
    }
    if (query.status) {
      qb.andWhere('res.status = :status', {status: query.status});
    }
  }

  private buildBaseReservationQuery(): SelectQueryBuilder<Reservation> {
    return this.reservationRepo.createQueryBuilder('res')
          .innerJoin('res.place', 'place')
          .innerJoin('place.booking_mode', 'bm');
  }

  private async paginateRaw<T>(qb: SelectQueryBuilder<any>,page = 1,limit = 10,orderBy = 'res.created_on'): Promise<{
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;
    const total = await qb.clone().select('res.id').getCount();

    const items = await qb.orderBy(orderBy, 'DESC')
                .offset(offset)
                .limit(limit)
                .getRawMany<T>();

    return {items,total,page,limit,totalPages: Math.ceil(total / limit)}
  } 
  
 }
