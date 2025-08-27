import { Roles } from "src/common/Interfaces";
import { RegisterDto } from "../dto/register-auth-dto";



export interface IRegisterStrategy<T extends RegisterDto>{

    register(dto:T,role:string):Promise<boolean>

}