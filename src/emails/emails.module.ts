import { Module, Global } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { EmailsService } from './emails.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppLoggerModule } from 'src/logger/logger.module';


@Module({
  imports: [ConfigModule,AppLoggerModule],
  providers: [
    EmailsService,
    {
      provide: 'MAIL_TRANSPORT',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return nodemailer.createTransport({
          host: config.get<string>('MAIL_HOST'),
          port: config.get<number>('MAIL_PORT'),
          secure: false,
          auth: {
            user: config.get<string>('MAIL_USERNAME'),
            pass: config.get<string>('MAIL_PASSWORD'),
          },
        });
      },
    },
  ],
  exports: [EmailsService],
})
export class EmailsModule {}
