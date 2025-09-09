import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EmailsModule } from './emails/emails.module';

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
    AuthModule,
    UsersModule,
    EmailsModule

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
