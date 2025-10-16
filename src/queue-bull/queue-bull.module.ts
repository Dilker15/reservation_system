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

@Module({
  imports:[
    BullModule.registerQueue(
    {
      name:'emails-queue'
    },
    {
      name:'imageupload-queue',
    }

  ),
    EmailsModule,
    ImageUploadModule, 
    forwardRef(() => PlacesModule),
  ],
  providers: [EnqueueMailServices,MailsProcessor,EnqueueImagesUploadServices,ImageUploadProcessor,ImageLocalService],
  exports:[EnqueueMailServices,EnqueueImagesUploadServices],
})
export class QueueBullModule {}
