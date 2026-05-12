import { EmailsService } from "src/emails/emails.service";
import { MailsProcessor } from "./queue.processor";
import { Test, TestingModule } from "@nestjs/testing";
import { Job } from "bullmq";
import { EMAIL_TYPE } from "src/common/Interfaces";
import { clear } from "console";
import { BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { AppLoggerService } from "src/logger/logger.service";





describe('QueueProcessor',()=>{
    let processor:MailsProcessor;
    let mockEmailService: Partial<jest.Mocked<EmailsService>>;
    const mockLogger:Partial<jest.Mocked<AppLoggerService>> = {
    withContext:jest.fn().mockReturnValue(({
        warn:jest.fn(),  
    }))
  }
    beforeEach(async()=>{
        jest.resetAllMocks();

        mockEmailService = {
             sendEmailVerificationCode: jest.fn(),
             sendReservationEmailClient: jest.fn(),
             sendReservationEmailAdmin: jest.fn(),
        }

        const modRef:TestingModule= await Test.createTestingModule({
            providers:[
                MailsProcessor,
                {
                    provide:EmailsService,
                    useValue:mockEmailService,
                },
                {
                    provide:AppLoggerService,
                    useValue:mockLogger
                }
            ]
        }).compile();
        processor = modRef.get<MailsProcessor>(MailsProcessor);
        
    });


    it("should send email_verification code",async()=>{
          const job = {
                data: {
                    data: {
                        data:{ code: 23422, message: "verification code test"},
                        to: "verification@gmail.com",
                        notification_type: EMAIL_TYPE.VERIFICATION_CODE,
                     },
                },
          } as unknown as Job;
        await processor.process(job);
        expect(mockEmailService.sendEmailVerificationCode).toHaveBeenCalledWith(job.data.data.to,job.data.data.data.code);
          
    });



    it("should send reservationEmailClient",async()=>{
         const job = {
                data: {
                    data: {
                        data:{ code: 23422, message: "verification code test"},
                        to: "reservationConfirm@gmail.com",
                        notification_type: EMAIL_TYPE.RESERVATION_CONFIRM,
                     },
                },
          } as unknown as Job;

          await processor.process(job);
          expect(mockEmailService.sendReservationEmailClient).toHaveBeenCalledWith(job.data.data.to,job.data.data.data)
    });



    it("should send reservationEmailAdmin",async()=>{
          const job = {
                data: {
                    data: {
                        data:{ code: 23422, message: "verification code test"},
                        to: "adminConfirm@gmail.com",
                        notification_type: EMAIL_TYPE.ADMIN_CONFIRM,
                     },
                },
          } as unknown as Job;
          await processor.process(job);
          expect(mockEmailService.sendReservationEmailAdmin).toHaveBeenCalledWith(job.data.data.to,job.data.data.data)
    });


    it("should fail with InternalServerErrorException if notification type is invalid",async()=>{
        const wrongType = 4;
        const job = {
                data: {
                    data: {
                        data:{ code: 23422, message: "verification code test"},
                        to: "failNotification@gmail.com",
                        notification_type: 'ANOTHER_TYPE' as EMAIL_TYPE.VERIFICATION_CODE,
                     },
                },
          } as unknown as Job;

       
      await expect(processor.process(job)).rejects.toThrow();
    });

    


});