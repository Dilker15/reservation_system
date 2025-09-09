import { BadRequestException, Injectable } from '@nestjs/common';
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

@Injectable()
export class AuthService {

  constructor(
    private readonly clienteStrategy:ClientRegisterStrategy,
    private readonly adminStrategy:AdminRegisterStrategy,
    private readonly userServices:UsersService,
    private readonly bcryptService:BcryptService,
    private readonly jwtService:JwtService,
    private readonly emailServices:EmailsService,
  ){
  }
  async create(createAuthDto:RegisterDto):Promise<UserResponseDto> {
    switch(createAuthDto.role){
          case Roles.ADMIN :
                return await this.adminStrategy.register(createAuthDto as AdminDto,Roles.ADMIN);
          case Roles.CLIENT:
                return await this.clienteStrategy.register(createAuthDto as ClientDto,Roles.CLIENT);    
          default:
            throw new BadRequestException("Error: Role User");
        }
  }
  

  async login(loginDto:LoginDto):Promise<LoginResponseDto>{
     const userFound = await this.userServices.findUserQuery(loginDto.email,{email_verified:true,is_active:true});
     const comparedPassword =  await this.bcryptService.verifyPassword(loginDto.password,userFound.password);
     if(!comparedPassword){
        throw new BadRequestException(`Email or password wrong`);
     }
     
     const token = await this.signJWToken({role:userFound.role,sub:userFound.id});
     await this.emailServices.sendEmailVerificationCode('dilker72@gmail.com,','C-33334');
     return {...this.loginResponse(userFound),token}
  }



  private async signJWToken(payload: payloadToken): Promise<string> {
    return this.jwtService.signAsync(payload,{secret:process.env.SEED_TOKEN,expiresIn:process.env.EXPIRATION_TOKEN});
  }


  private loginResponse(user:User):LoginResponseDto{
    const {email_verified,verification_code,password,created_at,updated_at,...resultResponse} = user;
    return resultResponse as LoginResponseDto;
  }

  

}
