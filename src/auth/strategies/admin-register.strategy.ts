import { AdminDto } from "../dto/create-admin-auth-dto";
import { IRegisterStrategy } from "./register.strategy";



export class AdminRegisterStrategy implements IRegisterStrategy<AdminDto>{


    register(dto:AdminDto,role:string): Promise<boolean> {
        throw new Error("Method not implemented.");
        
    }


}