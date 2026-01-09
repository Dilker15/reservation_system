import { UsersService } from "src/users/users.service";
import { AuthService } from "./auth.service";
import { AdminRegisterStrategy } from "./strategies/admin-register.strategy";
import { ClientRegisterStrategy } from "./strategies/client-register.strategy";
import { BcryptService } from "src/common/helpers/bcryp";
import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { RegisterDto } from "./dto/register-auth-dto";
import { Roles } from "src/common/Interfaces";
import { BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { LoginDto } from "./dto/login.dto";
import { AppLoggerService } from "src/logger/logger.service";
import { error } from "console";
import { VerifyEmailDto } from "./dto/verify-email.dto";

describe("auth.service.ts", () => {
  let service: AuthService;

  const mockAdminStrategy: Partial<AdminRegisterStrategy> = {
    register: jest.fn().mockResolvedValue({
      id: 'id_generated',
      email: 'ownertest@gmail.com',
      last_name: 'name_owner',
      name: 'last_name_owner',
      password: 'secure123',
      role: Roles.OWNER,
    }),
  };

  let mockLogger:Partial<AppLoggerService> = {
     withContext:jest.fn().mockReturnValue({
        error:jest.fn(),
        warn:jest.fn(),
        log:jest.fn(),
     })
  }

  const mockedUser = {
    id: "test-id", email: "test@gmail.com", password: "secure123" 
  }

  const mockClientStrategy: Partial<ClientRegisterStrategy> = {
    register: jest.fn().mockResolvedValue({
      id: 'id_generated',
      email: 'client@gmail.com',
      last_name: 'last_name',
      name: 'name',
      password: 'pass123',
      role: Roles.CLIENT,
    }),
  };

  let mockUserService: Partial<jest.Mocked<UsersService>> = {
    findUserQuery: jest.fn().mockResolvedValue(mockedUser),
    activateUser:jest.fn(),
  }

  let mockBcrypService: Partial<jest.Mocked<BcryptService>> = {
    verifyPassword: jest.fn().mockResolvedValue(true),
  }

  const mockConfigService: Partial<ConfigService> = {
    get: jest.fn().mockImplementation((key) =>
      key === 'SEED_TOKEN' ? 'secret_token' : 'default_token'
    ),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const refMod: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AdminRegisterStrategy,
          useValue: mockAdminStrategy
        },
        {
          provide: ClientRegisterStrategy,
          useValue: mockClientStrategy
        },
        {
          provide: UsersService,
          useValue: mockUserService,
        },
        {
          provide: BcryptService,
          useValue: mockBcrypService,
        },
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn().mockResolvedValue('tokenTest') },
        },
        {
          provide:AppLoggerService,
          useValue: mockLogger,
        },
        AuthService,
      ]
    }).compile();
    
    service = refMod.get<AuthService>(AuthService);
  });

  it("should create an owner user with correct data", async () => {
    const ownerDto: RegisterDto = {
      email: "ownertest@gmail.com",
      last_name: "name_owner",
      name: "last_name_owner",
      password: "secure123",
      role: Roles.OWNER,
    };
    
    const ownerCreated = await service.create(ownerDto);
    expect(mockAdminStrategy.register).toHaveBeenCalledWith(ownerDto, Roles.OWNER);
    expect(ownerCreated).toEqual({
      ...ownerDto,
      id: 'id_generated',
      role: Roles.OWNER,
    });
  });

  it("should create a client user with correct data", async () => {
    const clientDto: RegisterDto = {
      email: "client@gmail.com",
      last_name: "last_name",
      name: "name",
      password: "pass123",
      role: Roles.CLIENT,
    };
    
    const clientCreated = await service.create(clientDto);
    
    expect(mockClientStrategy.register).toHaveBeenCalledWith(clientDto, Roles.CLIENT);
    expect(clientCreated).toEqual({
      ...clientDto,
      id: 'id_generated',
      role: Roles.CLIENT,
    });
  });


  it("should throw a BadRequestException with wrong Role",async()=>{
    const wrongRole = 'super-client' as any;
    const wrongDto: RegisterDto = {
      email: "client@gmail.com",
      last_name: "last_name",
      name: "name",
      password: "pass123",
      role: wrongRole
    };


    await expect(service.create(wrongDto)).rejects.toThrow(new BadRequestException("Error: Role User"));
  });



  it("should log with correct data",async()=>{
    const loginData:LoginDto={email:'test@gmail.com',password:"secure1234"};
    const dataLogin = await service.login(loginData);

    expect(mockUserService.findUserQuery).toHaveBeenCalledWith(loginData.email,{email_verified:true,is_active:true});
    expect(mockBcrypService.verifyPassword).toHaveBeenCalledWith(loginData.password,mockedUser.password)
    expect(dataLogin).toMatchObject({
      email:loginData.email,
      token:'tokenTest',
      id:'test-id'
    })
  });



  it("should throw badRequest Exception with incorrectPassword",async()=>{
    const loginData:LoginDto={email:'test@gmail.com',password:"secure12"};
    mockBcrypService.verifyPassword!.mockResolvedValueOnce(false);
    await expect(service.login(loginData)).rejects.toThrow(new BadRequestException('Email or password wrong'));

  });


  it("should verifyEmail and activate user",async()=>{
      const data:VerifyEmailDto = {email:'test@gmail.com',verification_code:'23423'};
      await service.verifyEmail(data);
      expect(mockUserService.activateUser).toHaveBeenCalledWith(data);
  })


  
});