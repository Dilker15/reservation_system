import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsIn, IsString, Min, MinLength } from "class-validator";
import { Roles } from "src/common/Interfaces";


export class RegisterDto{

    @ApiProperty({description:'name', example:'dilkerdev'})
    @IsString({message:"name has not a correct format"})
    @MinLength(3,{message:"Name is too Short"})
    name:string;


    @ApiProperty({description:'last_name',example:'last_name test'})
    @IsString({message:"last name has not a correct format"})
    last_name:string;


    @ApiProperty({description:'email', example:'emailexample@test.com'})
    @IsString()
    @IsEmail()
    email:string;


    @ApiProperty({description:'password',example:'passwordtest'})
    @IsString()
    @MinLength(8,{message:"Password should have at least 8 characters"})
    password:string;

    @ApiProperty({description:`${Roles.OWNER} or ${Roles.CLIENT}`,example:'OWNER'})
    @IsString()
    @IsIn(['OWNER', 'CLIENT'])
    role: Roles;










}