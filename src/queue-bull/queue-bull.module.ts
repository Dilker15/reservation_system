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

@Module({
  imports:[
    BullModule.registerQueue(
    {
      name:'emails-queue',
      defaultJobOptions: {
        attempts: 3,           
        backoff: {
          type: 'exponential', 
          delay: 5000    
        },
        removeOnComplete: true,
        removeOnFail: false
      }
    },
    {
      name:'imageupload-queue',
      defaultJobOptions: {
        attempts: 5,           
        backoff: {
          type: 'exponential', 
          delay: 3000    
        },
        removeOnComplete: true,
        removeOnFail: false
      }
      
    }

  ),
    EmailsModule,
    ImageUploadModule,
    AppLoggerModule,
    forwardRef(() => PlacesModule),
  ],
  providers: [EnqueueMailServices,MailsProcessor,EnqueueImagesUploadServices,ImageUploadProcessor,ImageLocalService],
  exports:[EnqueueMailServices,EnqueueImagesUploadServices],
})
export class QueueBullModule {}
