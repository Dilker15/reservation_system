import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { ClientRegisterStrategy } from './strategies/client-register.strategy';
import { AdminRegisterStrategy } from './strategies/admin-register.strategy';
import { BcryptService } from 'src/common/helpers/bcryp';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { EmailsModule } from 'src/emails/emails.module';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/JwtStrategy';


@Module({
  controllers: [AuthController],
  providers: [AuthService,ClientRegisterStrategy,AdminRegisterStrategy,BcryptService,JwtStrategy],
  imports:[
    UsersModule,
    EmailsModule,
    ConfigModule,
    PassportModule.register({defaultStrategy:'jwt'}),
    JwtModule.registerAsync({
      imports:[ConfigModule],
      inject:[ConfigService],
      useFactory:(config:ConfigService)=>({
        secret: config.get<string>('SEED_TOKEN'),
        signOptions:{
          expiresIn:config.get<string>('EXPIRATION_TOKEN') as any,
        }
      }),
    })
  ],
  exports:[PassportModule]
})
export class AuthModule {}
