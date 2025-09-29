import { EmailsService } from "src/emails/emails.service";
import { MailsProcessor } from "./queue.processor";
import { Test, TestingModule } from "@nestjs/testing";
import { Job } from "bullmq";
import { EMAIL_TYPE } from "src/common/Interfaces";
import { clear } from "console";
import { BadRequestException, InternalServerErrorException } from "@nestjs/common";





describe('QueueProcessor',()=>{
    let processor:MailsProcessor;
    let mockEmailService: Partial<jest.Mocked<EmailsService>>;

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
                }
            ]
        }).compile();
        processor = modRef.get<MailsProcessor>(MailsProcessor);
        
    });


    it("should send email_verification code",async()=>{
          const job = {
                data: {
                    notification_type: EMAIL_TYPE.VERIFICATION_CODE,
                    data: {
                        to: "test@gmail.com",
                        data:{ code: 23422, message: "verification code test" },
                     },
                },
          } as unknown as Job;
        
        await processor.process(job);
        expect(mockEmailService.sendEmailVerificationCode).toHaveBeenCalledWith(job.data.data.to,job.data.data.data.code);
          
    });



    it("should send reservationEmailClient",async()=>{
         const job = {
                data: {
                    notification_type: EMAIL_TYPE.RESERVATION_CONFIRM,
                    data: {
                        to: "test@gmail.com",
                        data:{ code: 23422, message: "verification code test" },
                     },
                },
          } as unknown as Job;

          await processor.process(job);
          expect(mockEmailService.sendReservationEmailClient).toHaveBeenCalledWith(job.data.data.to,job.data.data.data)
    });



    it("should send reservationEmailAdmin",async()=>{
         const job = {
                data: {
                    notification_type: EMAIL_TYPE.ADMIN_CONFIRM,
                    data: {
                        to: "test@gmail.com",
                        data:{ code: 23422, message: "verification code test" },
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
                notification_type: wrongType,
                data: {
                    to: "test@gmail.com",
                    data:{ code: 23422, message: "verification code test" },
                 },
            },
      } as unknown as Job;

       
      await expect(processor.process(job)).rejects.toThrow(new InternalServerErrorException('Type Notification Email Does not exist'));
    });

    


});