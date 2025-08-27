import { IsEmail, IsIn, IsString, Min, MinLength } from "class-validator";


export class RegisterDto{

    @IsString({message:"name has not a correct format"})
    @MinLength(3,{message:"Name is too Short"})
    name:string;


    @IsString({message:"last name has not a correct format"})
    last_name:string;


    @IsString()
    @IsEmail()
    email:string;


    @IsString()
    @Min(8,{message:"Password should have at least 8 characters"})
    password:string;


    @IsString()
    @IsIn(['ADMIN', 'CLIENT'])
    role: string;










}