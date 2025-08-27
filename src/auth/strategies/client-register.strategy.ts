import { ClientDto } from "../dto/create-client-auth.dto";
import { IRegisterStrategy } from "./register.strategy";



export class ClientRegisterStrategy implements IRegisterStrategy<ClientDto>{

    
 
    register(dto: ClientDto,role:string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

}