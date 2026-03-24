import { IsEmail, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {

  @ApiProperty({example: 'user@example.com',description: 'User email address'})
  @IsEmail()
  email: string;

  @ApiProperty({example: '12345',description: '5-digit verification code sent to email'})
  @Matches(/^\d{5}$/, {message: 'Verification code must be 5 digits'})
  verification_code: string;
  
}