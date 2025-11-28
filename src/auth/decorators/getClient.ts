import { BadRequestException, createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";
import { Roles } from "src/common/Interfaces";
import { User } from "src/users/entities/user.entity";



export const GetClient = createParamDecorator((data:string|undefined,ctx:ExecutionContext)=>{

    console.log("get client");
    const requ = ctx.switchToHttp().getRequest();
    const user = requ.user as User;
    if(!user )
        throw new InternalServerErrorException('User not found OR  jtw(error)');

    console.log(user);
    if(!user.role.includes(Roles.CLIENT))
        throw new BadRequestException("Invalid Role for this action");

    return user;
})
