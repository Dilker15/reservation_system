import { Test } from "@nestjs/testing";
import { EmailsService } from "./emails.service"
import * as fs from 'fs/promises';
import { InternalServerErrorException } from "@nestjs/common";


const mockTransport = {
    sendMail:jest.fn(),
}

jest.mock('fs/promises',()=>({
   readFile:jest.fn(),
}));


describe("Email Services",()=>{

  let emailsService:EmailsService;

  beforeEach(async()=>{
     const ref = await Test.createTestingModule({
        providers:[
          EmailsService,
          {
            provide:'MAIL_TRANSPORT',
            useValue:mockTransport
          }
        ]
     }).compile();

     emailsService=ref.get<EmailsService>(EmailsService);
     (fs.readFile as jest.Mock).mockResolvedValue('<p> path resolved {{CODE}} </p>')
     jest.clearAllMocks();
  });

  it('should instance EmailService',()=>{
     expect(emailsService).toBeDefined();
  });

  


  it('should send verification_code email',async()=>{
     const to="test@gmail.com";
     const code="13514";
     
    await emailsService.sendEmailVerificationCode(to,code);
    expect(mockTransport.sendMail).toHaveBeenCalled();
  });


  it("should send reservation_confirm Admin email",async()=>{
     const to ="admin@gmail.com"
     const reservation_data ={
        name:'client 1',
        date:new Date().getTime(),
     };
     await emailsService.sendReservationEmailAdmin(to,reservation_data);
     expect(mockTransport.sendMail).toHaveBeenCalled();
  });



  it("should send reservation_confirm client email",async()=>{
    const to ="client@gmail.com";
    const data = {
      date:new Date(),
      place:'place 1'
    }

    await emailsService.sendReservationEmailClient(to,data)
    expect(mockTransport.sendMail).toHaveBeenCalled();
  });

  it("should throw a InternalServerError sending email",async()=>{
       
       const to ="client@gmail.com";
         const data = {
            date:new Date(),
            place:'place 1'
         }

      mockTransport.sendMail.mockRejectedValueOnce(new Error("transport error"));
      await expect(emailsService.sendReservationEmailClient(to,data)).rejects.toThrow(new InternalServerErrorException(`Email was not sent to: ${to}`));
  });


})