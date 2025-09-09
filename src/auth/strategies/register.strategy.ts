
import { UserResponseDto } from "src/users/dto/user-response.dto";
import { RegisterDto } from "../dto/register-auth-dto";




export interface IRegisterStrategy<T extends RegisterDto>{

    register(dto:T,role:string):Promise<UserResponseDto>

}