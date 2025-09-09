import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Transporter } from 'nodemailer';
import path from 'path';
import * as fs from 'fs/promises';
import { EMAIL_TYPE } from 'src/common/Interfaces';

@Injectable()
export class EmailsService {

  constructor(@Inject('MAIL_TRANSPORT') private readonly transporter: Transporter) {}


  
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
      console.error('Error sending email:', error);
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

  async sendReservationEmailClient(to: string, reservationId: string, name: string) {
    await this.sendEmailTemplate(
      to,
      'Reservation',
      'reservation_client.template.html',
      { RESERVATION_ID: reservationId, NAME: name }
    );
  }

  async sendReservationEmailAdmin(to: string, reservationId: string, name: string) {
    await this.sendEmailTemplate(
      to,
      'New Reservation',
      'reservation_admin.template.html',
      { RESERVATION_ID: reservationId, NAME: name }
    );
  }
}
