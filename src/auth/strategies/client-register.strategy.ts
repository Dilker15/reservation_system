import { Injectable } from "@nestjs/common";
import { ClientDto } from "../dto/create-client-auth.dto";
import { IRegisterStrategy } from "./register.strategy";
import { UsersService } from "src/users/users.service";
import { User } from "src/users/entities/user.entity";
import { UserResponseDto } from "src/users/dto/user-response.dto";


@Injectable()
export class ClientRegisterStrategy implements IRegisterStrategy<ClientDto>{

    
    constructor(private readonly userService:UsersService){
        
    }

    async register(dto: ClientDto,role:string): Promise<UserResponseDto> {
        return this.userService.create(dto,dto.role);
    }

}