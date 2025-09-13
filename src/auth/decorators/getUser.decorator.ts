import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";


export const GetUser = createParamDecorator((data:string|undefined,ctx:ExecutionContext)=>{

    const requ = ctx.switchToHttp().getRequest();
    const user = requ.user;
    if(!user)
        throw new InternalServerErrorException('User not found OR  jtw(error)');

    return user;
});