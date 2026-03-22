import { forwardRef, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EnqueueMailServices } from './enqueue-mail-services';
import { MailsProcessor } from './queue.processor';
import { EmailsModule } from 'src/emails/emails.module';
import { EnqueueImagesUploadServices } from './enqueue-images.services';
import { ImageUploadModule } from 'src/image-upload/image-upload.module';
import { ImageUploadProcessor } from './queue-images-upload.processor';
import { ImageLocalService } from 'src/common/helpers/imageLocalService';
import { PlacesModule } from 'src/places/places.module';
import { AppLoggerModule } from 'src/logger/logger.module';
import { EnqueueReservationsJobService } from './enqueue-reservations-job.services';
import { ReservationModule } from 'src/reservation/reservation.module';
import { ReservationsScheduleProcessor } from './queue-reservations-shedule-job.processor';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: 'notifications.email',
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          removeOnComplete: true,
          removeOnFail: 1000,
        },
      },
      {
        name: 'media.image-upload',
        defaultJobOptions: {
          attempts: 5,
          backoff: {
            type: 'exponential',
            delay: 3000,
          },
          removeOnComplete: true,
          removeOnFail: 1000,
        },
      },
      {
        name: 'reservations.expiration',
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 4000,
          },
          removeOnComplete: true,
          removeOnFail: 1000,
        },
      },
    ),

    EmailsModule,
    ImageUploadModule,
    AppLoggerModule,
    ReservationModule,
    forwardRef(() => PlacesModule),
  ],

  providers: [
    EnqueueMailServices,
    MailsProcessor,

    EnqueueImagesUploadServices,
    ImageUploadProcessor,
    ImageLocalService,

    EnqueueReservationsJobService,
    ReservationsScheduleProcessor,
  ],

  exports: [
    EnqueueMailServices,
    EnqueueImagesUploadServices,
    EnqueueReservationsJobService,
  ],
})
export class QueueBullModule {}