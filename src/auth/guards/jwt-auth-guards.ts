import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { firstValueFrom, Observable } from 'rxjs';
import { PUBLIC_KEY } from "../decorators/public.decorator";
import { KEY_ROLES } from "../decorators/role.decorator";
import { User } from "src/users/entities/user.entity";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) {
      return true;
    }

    const result = super.canActivate(context);
    const isActive = result instanceof Observable
      ? await firstValueFrom(result)
      : await result;

    if(!isActive){
        throw new UnauthorizedException('Not Authorized or Token Missing');
    }
    const resp = context.switchToHttp().getRequest();
    const user = resp.user as User;
    const userRole = user.role;
    const roles = this.reflector.getAllAndOverride<string[]>(
        KEY_ROLES,
        [context.getHandler(),context.getClass()]
    );
    const hasPermission = roles.includes(userRole);
    if(!hasPermission)
        throw new UnauthorizedException('Permission Denegated')

    return isActive;
  }
}
