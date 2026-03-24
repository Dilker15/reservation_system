import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { AnalyticsPeriod } from './enums/period.enum';
import { subDays } from 'date-fns';
import { Place } from 'src/places/entities/place.entity';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import { RESERVATION_STATUS } from 'src/common/Interfaces';
import { ReservationStatsByPlace, RevenueByPlace } from './interfaces/Analytics.interfaces';
import { CacheRedisService } from 'src/cache-redis/cache-redis.service';


@Injectable()
export class AnalyticsService {
  private readonly TOP_RESERVATION_STATUSES = [
    RESERVATION_STATUS.PAID,
    RESERVATION_STATUS.COMPLETED,
    RESERVATION_STATUS.IN_PROGRESS,
    RESERVATION_STATUS.CREATED,
  ];

  constructor(private readonly dataSource: DataSource,private readonly cacheService:CacheRedisService) {}


  async getDashboard(period: AnalyticsPeriod,owner: User): Promise<{revenuesByPlace: RevenueByPlace[];topPlaces: ReservationStatsByPlace[];bottomPlaces: ReservationStatsByPlace[],summary:any}> {
    const [revenues, topPlaces, bottomPlaces,summary] = await Promise.all([
      this.getRevenueByPlaces(period, owner).catch((err) => {
        console.error(`Error fetching revenues:`, err);
        return [];
      }),
      this.getTopReservations(owner).catch((err) => {
        console.error(`Error fetching top reservations:`, err);
        return [];
      }),
      this.getBottomReservations(owner).catch((err) => {
        console.error(`Error fetching bottom reservations:`, err);
        return [];
      }),
      this.getReservationsSummary(owner).catch((err)=>{
        console.error(`Error fetching bottom reservations:`, err);
        return [];
      })
    ]);

    return { revenuesByPlace: revenues, topPlaces, bottomPlaces ,summary};
  }


  async getRevenueByPlaces(period: AnalyticsPeriod,owner: User): Promise<RevenueByPlace[]> {
    const { from, to } = this.resolvePeriod(period);
    const fromDate = this.formatDateForDB(from);
    const toDate = this.formatDateForDB(to);
    const key = `owner:${owner.id}:analytics:revenue`;
    
    try {
      const cachedData = await this.cacheService.get<RevenueByPlace[]>(key);
      if(cachedData){
         return cachedData;
      }
      const data = await this.dataSource
        .createQueryBuilder()
        .select('p.id', 'id')
        .addSelect('p.name', 'name')
        .addSelect('SUM(res.total_price * res.amount)', 'totalRevenue')
        .from(Place, 'p')
        .innerJoin(
          Reservation,
          'res',
          'res.place_id = p.id AND res.status IN (:...statuses)',
          { statuses: this.TOP_RESERVATION_STATUSES },
        )
        .where('p.owner_id = :ownerId', { ownerId: owner.id })
        .andWhere('DATE(res.created_on) BETWEEN :from AND :to', { from: fromDate, to: toDate })
        .groupBy('p.id')
        .orderBy('SUM(res.total_price * res.amount)', 'DESC')
        .getRawMany();
      await this.cacheService.set(key,data,120);
      return data;
    } catch (error) {
      console.error(`Error fetching revenue for owner ${owner.id}:`, error);
      throw new Error(`Failed to fetch revenue for owner ${owner.id}`);
    }
  }


  async getReservationsSummary(owner: User) {
    try {
      const data = await this.dataSource
        .createQueryBuilder()
        .select([
          `SUM(CASE WHEN res.status IN (:...validStatuses) THEN 1 ELSE 0 END) AS total_valid`,
          `SUM(CASE WHEN res.status = :cancelled THEN 1 ELSE 0 END) AS total_cancelled`,
          `SUM(CASE WHEN res.status = :expired THEN 1 ELSE 0 END) AS total_expired`,
        ])
        .from('reservations', 'res')
        .innerJoin('places', 'pla', 'res.place_id = pla.id')
        .innerJoin('users', 'own', 'pla.owner_id = own.id')
        .where('own.id = :ownerId', { ownerId: owner.id })
        .andWhere('res.status <> :created', {
          created: RESERVATION_STATUS.CREATED,
        })
        .setParameters({
          validStatuses: [RESERVATION_STATUS.PAID,RESERVATION_STATUS.IN_PROGRESS,RESERVATION_STATUS.COMPLETED],
          cancelled: RESERVATION_STATUS.CANCELLED,
          expired: RESERVATION_STATUS.EXPIRED,
        })
        .getRawOne();

      return {
        totalValid: Number(data.total_valid),
        totalCancelled: Number(data.total_cancelled),
        totalExpired: Number(data.total_expired),
      };
    } catch (error) {
      console.error('Error fetching reservations summary:', error);
      throw new Error(`Failed to fetch reservations summary for owner ${owner.id}`);
    }
  }



  async getTopReservations(owner: User,limit = 5): Promise<ReservationStatsByPlace[]> {
    return this.getReservationsByPlace(owner, 'DESC', limit);
  }


  async getBottomReservations(owner: User,limit = 5): Promise<ReservationStatsByPlace[]> {
    return this.getReservationsByPlace(owner, 'ASC', limit);
  }

 
  private async getReservationsByPlace(owner: User,order: 'ASC' | 'DESC',limit: number): Promise<ReservationStatsByPlace[]> {
    const key = `owner:${owner.id}:analytics:reservations:${order}:limit:${limit}`;
    try {
       const cachedData = await this.cacheService.get<ReservationStatsByPlace[]>(key);
       if(cachedData){
         return cachedData;
       }
       const data = await this.dataSource
        .createQueryBuilder()
        .select('p.id', 'placeId')
        .addSelect('p.name', 'placeName')
        .addSelect('COUNT(res.id)', 'totalReservations')
        .from(Place, 'p')
        .leftJoin(Reservation, 'res', 'res.place_id = p.id AND res.status IN (:...statuses)', {
          statuses: this.TOP_RESERVATION_STATUSES,
        })
        .where('p.owner_id = :ownerId', { ownerId: owner.id })
        .groupBy('p.id')
        .addGroupBy('p.name')
        .orderBy('COUNT(res.id)', order)
        .limit(limit)
        .getRawMany();
        await this.cacheService.set(key,data,120);
        return data;
    } catch (error) {
      console.error(`Error fetching reservations (${order}) for owner ${owner.id}:`, error);
      throw new Error(`Failed to fetch reservations for owner ${owner.id}`);
    }
  }


  private resolvePeriod(period: AnalyticsPeriod): { from: Date; to: Date } {
    const now = new Date();
    switch (period) {
      case AnalyticsPeriod.LAST_7_DAYS:
        return { from: subDays(now, 7), to: now };
      case AnalyticsPeriod.LAST_60_DAYS:
        return { from: subDays(now, 60), to: now };
      case AnalyticsPeriod.LAST_30_DAYS:
      default:
        return { from: subDays(now, 30), to: now };
    }
  }

  private formatDateForDB(date: Date): string {
    return date.toISOString().split('T')[0]; 
  }


}
