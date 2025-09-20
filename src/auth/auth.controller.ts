import { Controller, Post, Body ,HttpCode, HttpStatus, NotImplementedException, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register-auth-dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { User } from 'src/users/entities/user.entity';
import { GetUser } from './decorators/getUser.decorator';
import { Public } from './decorators/public.decorator';
import { Role } from './decorators/role.decorator';
import { Roles } from 'src/common/Interfaces';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,
  ) {}



  @Public()
  @Post('/register')
  register(@Body() createAuthDto: RegisterDto) {
    return this.authService.create(createAuthDto);
  }

  @Public()
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto:LoginDto){
    return this.authService.login(loginDto)
  }


  @Role(Roles.OWNER,Roles.CLIENT)
  @Post('/verify-email')
  verifyEmail(@Body() verifyDto:VerifyEmailDto){
   throw new NotImplementedException('verify-email endpoint is not implemented yet');
  }


  @Post('/restore-password')
  restorePassword(@Body() body:any){
    throw new NotImplementedException('restorePassword endpoint is not implemented yet');
  }


  @Post('reset-password')
  resetPassword(@Body() body:any){
    throw new NotImplementedException('resetPassword endpoint is not implemented yet');
  }





}
