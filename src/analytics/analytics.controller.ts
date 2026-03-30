import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Role } from 'src/auth/decorators/role.decorator';
import { Roles } from 'src/common/Interfaces';
import { GetUser } from 'src/auth/decorators/getUser.decorator';
import { User } from 'src/users/entities/user.entity';
import { AnalyticsPeriod } from './enums/period.enum';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Analytics')
@ApiBearerAuth()
@Role(Roles.OWNER)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue analytics by place' })
  @ApiQuery({name: 'period',required: false,enum: AnalyticsPeriod,example: AnalyticsPeriod.LAST_30_DAYS})
  getReservations(@Query('period') period: AnalyticsPeriod = AnalyticsPeriod.LAST_30_DAYS,
                   @GetUser() owner: User,
  ) {
    return this.analyticsService.getRevenueByPlaces(period, owner);
  }

  @Get('revenue/top')
  @ApiOperation({ summary: 'Get top performing places by reservations' })
  getTopReservations(@GetUser() owner: User) {
    return this.analyticsService.getTopReservations(owner);
  }

  @Get('revenue/bottom')
  @ApiOperation({ summary: 'Get lowest performing places by reservations' })
  getBottomReservations(@GetUser() owner: User) {
    return this.analyticsService.getBottomReservations(owner);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get reservations summary for owner' })
  getSummary(@GetUser() owner: User) {
    return this.analyticsService.getReservationsSummary(owner);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get analytics dashboard data' })
  @ApiQuery({name: 'period',required: false,enum: AnalyticsPeriod,example: AnalyticsPeriod.LAST_30_DAYS,})
  getDashboard(@Query('period') period: AnalyticsPeriod = AnalyticsPeriod.LAST_30_DAYS,
               @GetUser() owner: User,
  ) {
    return this.analyticsService.getDashboard(period, owner);
  }
}