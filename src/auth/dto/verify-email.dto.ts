import { IsEmail, IsString, Length, Matches } from "class-validator";

export class VerifyEmailDto{


    @IsEmail()
    email:string;

    
    @Matches(/^\d{5}$/, { message: 'Verification code must be 5 digits' })
    verification_code: string;


}