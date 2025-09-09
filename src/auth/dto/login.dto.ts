import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Min, MinLength } from "class-validator";


export class LoginDto{

    @ApiProperty({description:'User email',example:'emailexample@swagger.com'})
    @IsString()
    @IsEmail()
    email:string;

    @ApiProperty({description:'User password',example:'test_password'})
    @IsString()
    @MinLength(8,{message:"Password wrong verify password"})
    password:string;

}