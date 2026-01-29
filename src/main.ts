import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ResponseInterceptor } from './common/interceptors/response/response.interceptor';
import { ErrorsFilter } from './common/filters/errors/errors.filter';
import { JwtAuthGuard } from './auth/guards/jwt-auth-guards';
import { seedCategory } from './shared/seeders/category.seeder';
import { DataSource } from 'typeorm';
import { seedBookingMode } from './shared/seeders/booking-mode.seeder';
import { AppLoggerService } from './logger/logger.service';
import * as bodyParser from 'body-parser';


async function bootstrap() {
  const app = await NestFactory.create(AppModule,{
    bufferLogs:true,
  });
  app.enableCors({
    origin: process.env.FRONT_END_URL,
    credentials: true,
  });
  

  
  app.use('/api/v1/reservations/webhook/STRIPE',bodyParser.raw({ type: 'application/json' }));
  const reflector = app.get(Reflector);
  app.setGlobalPrefix('/api/v1/reservations');
  app.useGlobalPipes(new ValidationPipe({
    whitelist:true,               
    forbidNonWhitelisted:true,   
    transform:true
  }));
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new ErrorsFilter())
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  
    const config = new DocumentBuilder()
    .setTitle('Reservations API')      
    .setDescription('Reservation System') 
    .setVersion('1.0')                
    .addBearerAuth()
    .build();


    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs',app, document);
    const dataSource = app.get(DataSource);
    Promise.all([seedCategory(dataSource),seedBookingMode(dataSource)]);
    const logger = app.get(AppLoggerService);
    app.useLogger(logger);

    
    await app.listen(process.env.APP_PORT ?? 4000);



  console.log(`APP IS RUNNING ON PORT :  ${process.env.APP_PORT}`);
}
bootstrap();
