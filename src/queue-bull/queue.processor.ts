import { Processor, WorkerHost } from "@nestjs/bullmq";
import { InternalServerErrorException } from "@nestjs/common";
import { Job } from "bullmq";
import { EMAIL_TYPE } from "src/common/Interfaces";
import { EmailsService } from "src/emails/emails.service";
import { AppLoggerService } from "src/logger/logger.service";





@Processor('emails-queue')
export class MailsProcessor extends WorkerHost{

    private logger:AppLoggerService;

    constructor(private readonly emailService:EmailsService,private readonly appLogService:AppLoggerService){
        super();
        this.logger = appLogService.withContext(MailsProcessor.name);
    }

    async process(job: Job, token?: string): Promise<any> {
        const {to,data} = job.data.data;
        switch(job.data.notification_type){
            case EMAIL_TYPE.VERIFICATION_CODE:
                await this.emailService.sendEmailVerificationCode(to,data.code);
                break;
            case EMAIL_TYPE.RESERVATION_CONFIRM:
                await this.emailService.sendReservationEmailClient(to,data);
                break;
            case EMAIL_TYPE.ADMIN_CONFIRM:
                await this.emailService.sendReservationEmailAdmin(to,data);
                break
            default:
                this.logger.warn("EMAIL TYPE doest not exist :" +job.data.notification_type);
                throw new InternalServerErrorException("Type Notification Email Does not exist");
        }
    }






}