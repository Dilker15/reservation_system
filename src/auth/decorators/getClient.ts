import { BadRequestException, createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";
import { Roles } from "src/common/Interfaces";
import { User } from "src/users/entities/user.entity";







export const getClientFunc = (data:string|undefined,ctx:ExecutionContext)=>{
    const requ = ctx.switchToHttp().getRequest();
    const user = requ.user as User;
    if(!user )
        throw new InternalServerErrorException('Client not found OR  jtw(error)');

    if(!user.role.includes(Roles.CLIENT))
        throw new BadRequestException("Invalid Role for this action");

    return user;
}

export const GetClient = createParamDecorator(getClientFunc)