import { Module, Global } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { EmailsService } from './emails.service';
import { ConfigModule, ConfigService } from '@nestjs/config';


@Module({
  imports: [ConfigModule],
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
