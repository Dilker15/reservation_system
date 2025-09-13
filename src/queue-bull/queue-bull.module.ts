import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EnqueueMailServices } from './enqueue-mail-services';
import { MailsProcessor } from './queue.processor';
import { EmailsModule } from 'src/emails/emails.module';

@Module({
  imports:[
    BullModule.registerQueue({
      name:'emails-queue'
    }),
    EmailsModule,
  ],
  providers: [EnqueueMailServices,MailsProcessor],
  exports:[EnqueueMailServices],
})
export class QueueBullModule {}
