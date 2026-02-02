import { IsNotEmpty, IsString, MinLength } from "class-validator";




export class DisconnectPaymentAccountDto {

    @IsString()
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(7, { message: 'Password must be at least 6 characters' })
    password: string;

  }