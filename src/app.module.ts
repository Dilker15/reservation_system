import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EmailsModule } from './emails/emails.module';
import { BullModule } from '@nestjs/bullmq';
import { QueueBullModule } from './queue-bull/queue-bull.module';
import { PlacesModule } from './places/places.module';
import { CountriesModule } from './countries/countries.module';
import { BookingModeModule } from './booking-mode/booking-mode.module';
import { CategoriesModule } from './categories/categories.module';


@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports:[ConfigModule],
      inject:[ConfigService],
      useFactory:(config:ConfigService)=>({
         type:'postgres',
         database:config.get<string>('DB_NAME'),
         port:config.get<number>('DB_PORT'),
         host:config.get<string>('DB_HOST'),
         username:config.get<string>('DB_USERNAME'),
         password:config.get<string>('DB_PASSWORD'),
         synchronize:true,
         autoLoadEntities:true,
      })
    }),
    BullModule.forRootAsync({
      imports:[ConfigModule],
      inject:[ConfigService],
      useFactory:(config:ConfigService)=>({
        connection:{
          host:config.get<string>('REDIS_HOST'),
          port:config.get<number>('REDIS_PORT'),
        }
      })
    }),
    AuthModule,
    UsersModule,
    EmailsModule,
    QueueBullModule,
    PlacesModule,
    CountriesModule,
    BookingModeModule,
    CategoriesModule,

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
