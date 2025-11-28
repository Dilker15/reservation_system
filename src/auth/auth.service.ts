import { BadRequestException, Injectable, LoggerService, NotFoundException } from '@nestjs/common';
import { ClientRegisterStrategy } from './strategies/client-register.strategy';
import { AdminRegisterStrategy } from './strategies/admin-register.strategy';
import { RegisterDto } from './dto/register-auth-dto';
import { EMAIL_TYPE, payloadToken, Roles } from 'src/common/Interfaces';
import { AdminDto } from './dto/create-admin-auth-dto';
import { ClientDto } from './dto/create-client-auth.dto';
import { UserResponseDto } from 'src/users/dto/user-response.dto';
import { LoginDto } from './dto/login.dto';
import { UsersService } from 'src/users/users.service';
import { BcryptService } from 'src/common/helpers/bcryp';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { LoginResponseDto } from './dto/login-response.dto';
import { EmailsService } from 'src/emails/emails.service';
import { EnqueueMailServices } from 'src/queue-bull/enqueue-mail-services';
import { ConfigService } from '@nestjs/config';
import { AppLoggerService } from 'src/logger/logger.service';
import { error } from 'console';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Injectable()
export class AuthService {

    private logger: AppLoggerService;

  constructor(
    private readonly clienteStrategy:ClientRegisterStrategy,
    private readonly adminStrategy:AdminRegisterStrategy,
    private readonly userServices:UsersService,
    private readonly bcryptService:BcryptService,
    private readonly jwtService:JwtService,
    private readonly conf:ConfigService,
    private readonly loggerService:AppLoggerService,
  ){
     this.logger = loggerService.withContext(AuthService.name);
  }
  async create(createAuthDto:RegisterDto):Promise<UserResponseDto> {
    switch(createAuthDto.role){
          case Roles.OWNER :
                return await this.adminStrategy.register(createAuthDto as AdminDto,Roles.OWNER);
          case Roles.CLIENT:
                return await this.clienteStrategy.register(createAuthDto as ClientDto,Roles.CLIENT);    
          default:
            this.logger.error("error create user with incorrect role");
            throw new BadRequestException("Error: Role User");
        }
  }
  

  async login(loginDto:LoginDto){
     const userFound = await this.userServices.findUserQuery(loginDto.email,{email_verified:true,is_active:true});
     const comparedPassword =  await this.bcryptService.verifyPassword(loginDto.password,userFound.password);
     if(!comparedPassword){
        this.logger.warn("failed user loggin : passwor wrong : " + userFound.email);
        throw new BadRequestException(`Email or password wrong`);
     }
     const token = await this.signJWToken({role:userFound.role,sub:userFound.id});
     this.logger.log("login successfully : "+loginDto.email)
     return {...this.loginResponse(userFound),token}
  }


  async verifyEmail(verifyDto:VerifyEmailDto){
      return this.userServices.activateUser(verifyDto);
  }

  

  private async signJWToken(payload: payloadToken): Promise<string> {
    return this.jwtService.signAsync(payload);
  }



  private loginResponse(user:User):LoginResponseDto{
    const {email_verified,verification_code,password,created_at,updated_at,...resultResponse} = user;
    return resultResponse as LoginResponseDto;
  }

  

}
