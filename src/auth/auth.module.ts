import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { ClientRegisterStrategy } from './strategies/client-register.strategy';
import { AdminRegisterStrategy } from './strategies/admin-register.strategy';
import { BcryptService } from 'src/common/helpers/bcryp';
import { JwtService } from '@nestjs/jwt';
import { EmailsModule } from 'src/emails/emails.module';


@Module({
  controllers: [AuthController],
  providers: [AuthService,ClientRegisterStrategy,AdminRegisterStrategy,BcryptService,JwtService],
  imports:[UsersModule,EmailsModule]
})
export class AuthModule {}
