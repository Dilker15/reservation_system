import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

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
    })

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
