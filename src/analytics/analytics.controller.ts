import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Role } from 'src/auth/decorators/role.decorator';
import { Roles } from 'src/common/Interfaces';
import { GetUser } from 'src/auth/decorators/getUser.decorator';
import { User } from 'src/users/entities/user.entity';
import { AnalyticsPeriod } from './enums/period.enum';


@Role(Roles.OWNER)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  

  
  @Get('revenue')
  getReservations(@Query('period') period: AnalyticsPeriod = AnalyticsPeriod.LAST_30_DAYS,@GetUser() owner:User) {
    return this.analyticsService.getRevenueByPlaces(period,owner);
  }


 
  @Get('revenue/top')
  getTopReservations(@GetUser() owner:User) {
    return this.analyticsService.getTopReservations(owner);
  }


  @Get('revenue/bottom')
  getBottomReservations(@GetUser() owner:User) {
    return this.analyticsService.getBottomReservations(owner);
  }


  @Get('dashboard')
  getDashboard(@Query('period') period: AnalyticsPeriod = AnalyticsPeriod.LAST_30_DAYS, @GetUser() owner:User){
    return this.analyticsService.getDashboard(period,owner);
  }


}
