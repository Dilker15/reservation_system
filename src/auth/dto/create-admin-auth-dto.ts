import { IsString } from "class-validator";
import { RegisterDto } from "./register-auth-dto";


export class AdminDto extends RegisterDto{

    @IsString()
    phone_number:string;

}