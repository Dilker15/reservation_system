import { Injectable } from "@nestjs/common";
import { AdminDto } from "../dto/create-admin-auth-dto";
import { IRegisterStrategy } from "./register.strategy";
import { UsersService } from "src/users/users.service";
import { UserResponseDto } from "src/users/dto/user-response.dto";



@Injectable()
export class AdminRegisterStrategy implements IRegisterStrategy<AdminDto>{

    constructor(private readonly userService:UsersService){

    }

    async register(dto:AdminDto,role:string):Promise<UserResponseDto> {
      return this.userService.create(dto,dto.role);
        
    }


}