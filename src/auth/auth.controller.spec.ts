import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register-auth-dto';
import { Roles } from 'src/common/Interfaces';
import { ClientRegisterStrategy } from './strategies/client-register.strategy';
import { AdminRegisterStrategy } from './strategies/admin-register.strategy';
import { UsersService } from 'src/users/users.service';
import { BcryptService } from 'src/common/helpers/bcryp';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import { NotImplementedException } from '@nestjs/common';


const mockAuthService= {
  create:jest.fn(),
  login:jest.fn(),
}


describe('AuthController', () => {
  let controller: AuthController;
  let service:typeof mockAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
          {
            provide:AuthService,
            useValue:mockAuthService,
          }
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<typeof mockAuthService>(AuthService);
    jest.resetAllMocks();
  });


  it("should call register service with correct data",async()=>{
      const registerData:RegisterDto={email:'test@gmail.com',last_name:'cp',name:'testing',password:"password1",role:Roles.OWNER};
      await controller.register(registerData);
      expect(service.create).toHaveBeenCalledWith(registerData);
  });

    it("should call login method with correct data",async()=>{
      const loginData:LoginDto={email:'test1@gmail.com',password:'password123'};
      await controller.login(loginData);
      expect(service.login).toHaveBeenCalledWith(loginData);
    });

    it('verifyEmail should throw NotImplementedException', () => {
       expect(() => controller.verifyEmail({ email: 'test@test.com', verification_code: '1234' }))
       .toThrow();
    });

    it("restorePassword should throw NotImplementedException",()=>{
      expect(() => controller.restorePassword({ email: 'test@test.com' }))
      .toThrow();
    });

    it('resetPassword should throw NotImplementedException',() => {
      expect(() => controller.resetPassword({ email: 'test@test.com' }))
      .toThrow();
    });
});
