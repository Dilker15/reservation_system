import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { payloadToken } from 'src/common/Interfaces';
import { UsersService } from 'src/users/users.service';



@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly config: ConfigService,private readonly userService:UsersService) {

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), 
      ignoreExpiration: false,                               
      secretOrKey: config.get<string>('SEED_TOKEN') || 'temporaly_token_,..,ljhgfds8g-asf+`+',
    });
  }

  
  async validate(payload: payloadToken) {
     const currentUser = await this.userService.findUserValidById(payload.sub);
     return currentUser;
  }
}
