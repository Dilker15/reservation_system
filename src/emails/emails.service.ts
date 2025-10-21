import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Transporter } from 'nodemailer';
import path from 'path';
import * as fs from 'fs/promises';
import { EMAIL_TYPE } from 'src/common/Interfaces';
import { AppLoggerService } from 'src/logger/logger.service';

@Injectable()
export class EmailsService {

  private logger:AppLoggerService;

  constructor(@Inject('MAIL_TRANSPORT') private readonly transporter: Transporter,private readonly loggerService:AppLoggerService) {
    this.logger = this.loggerService.withContext(EmailsService.name);
  }


  
  private async sendEmailTemplate(
    to: string,
    subject: string,
    templateName: string,
    variables: Record<string, string>
  ) {
    try {
      const templatePath = path.join(process.cwd(), 'src', 'email_templates', templateName);
      let template = await fs.readFile(templatePath, 'utf-8');

      for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        template = template.replace(regex, value);
      }

      await this.transporter.sendMail({
        from: `"Pro - Reservation" <${process.env.MAIL_USER}>`,
        to,
        subject,
        html: template,
      });
    } catch (error) {
      //console.error('Error sending email:', error);
      this.logger.error("Email sending error to email : "+ to,error.trace);
      throw new InternalServerErrorException(`Email was not sent to: ${to}`);
    }
  }


  
  async sendEmailVerificationCode(to: string, code: string) {
    await this.sendEmailTemplate(
      to,
      'Verification Code',
      'verification_code.template.html',
      { CODE: code }
    );
  }


  async sendReservationEmailClient(to: string,reservation_data:any) {
    await this.sendEmailTemplate(
      to,
      'Reservation Succesfull',
      'reservation_confirm.template.html',
      { ...reservation_data}
    );
  }



  async sendReservationEmailAdmin(to: string,reservation_data:any) {
    await this.sendEmailTemplate(
      to,
      'New Reservation',
      'reservation_admin.template.html',
      { ...reservation_data}
    );
  }
}
