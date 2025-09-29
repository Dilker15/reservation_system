import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { GeneratorCodeService } from 'src/common/helpers/codeGenerator';
import { BcryptService } from 'src/common/helpers/bcryp';
import { EnqueueMailServices } from 'src/queue-bull/enqueue-mail-services';
import { EMAIL_TYPE, Roles } from 'src/common/Interfaces';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RegisterDto } from 'src/auth/dto/register-auth-dto';
import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let mockUserRepo : Partial<jest.Mocked<Repository<User>>>;
  let mockGeneratorCode:Partial<jest.Mocked<GeneratorCodeService>>;
  let mockBcrypService:Partial<jest.Mocked<BcryptService>>;
  let mockEnqueMail:Partial<jest.Mocked<EnqueueMailServices>>;

  const userMockData:User = { 
    created_at:new Date(),
    email:'test@gmail.com',
    email_verified:true,
    is_active:true,
    last_name:'last_name test',
    name:'name test',
    password:'secure123',
    role:Roles.CLIENT,
    id:'test_id',
    updated_at:new Date(),
    verification_code:'12345',
  }


  beforeEach(async () => {
    jest.clearAllMocks();

    
    mockBcrypService  = {
      hashPassword:jest.fn().mockResolvedValue(userMockData.password),
    }

    mockUserRepo = {
      findOne:jest.fn(),
      findOneBy:jest.fn().mockResolvedValue(userMockData),
      create:jest.fn().mockReturnValue(userMockData),
      save:jest.fn().mockResolvedValue({...userMockData,id:'id_test'}),
    }

    mockGeneratorCode = {
      generate:jest.fn().mockReturnValue(12345)
    }

    mockEnqueMail = {
      enqueEmail:jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide:GeneratorCodeService,
          useValue:mockGeneratorCode,
        },
        {
          provide:BcryptService,
          useValue:mockBcrypService,
        },
        {
          provide:EnqueueMailServices,
          useValue:mockEnqueMail,
        },
        {
          provide:getRepositoryToken(User),
          useValue:mockUserRepo,
        }

      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });


  it("should create an user with correct data",async()=>{
     const userData:RegisterDto ={
      email:'test@gmail.com',
      last_name:'last_name',
      name:'name',
      password:'secure123',
      role:Roles.CLIENT,
     }
     const codeTest= 12345;
     const email_type = EMAIL_TYPE.VERIFICATION_CODE;
     
     const userCreated = await service.create(userData,userData.role);
     
     expect(mockUserRepo.findOne).toHaveBeenCalledWith({where:{email:userData.email}});
     expect(mockBcrypService.hashPassword).toHaveBeenCalledWith(userData.password);
     expect(mockGeneratorCode.generate).toHaveBeenCalled();
     expect(mockUserRepo.create).toHaveBeenCalledWith({...userData,password:userMockData.password,verification_code:codeTest,role:userData.role});
     expect(mockUserRepo.save).toHaveBeenCalledWith(userMockData);
     expect(mockEnqueMail.enqueEmail).toHaveBeenCalledWith(email_type,{to:userMockData.email,data:{code:codeTest}});
     expect(userCreated).toHaveProperty('id');
  });



  it("should throw ConflictException if user already exists",async()=>{
    const userData:RegisterDto ={
      email:'test@gmail.com',
      last_name:'last_name',
      name:'name',
      password:'secure123',
      role:Roles.CLIENT,
     }
     mockUserRepo.findOne?.mockResolvedValueOnce(userMockData);

     await expect(service.create(userData,userData.role)).rejects.toThrow(ConflictException);
     expect(mockUserRepo.create).not.toHaveBeenCalled();
     expect(mockUserRepo.save).not.toHaveBeenCalled();
     expect(mockEnqueMail.enqueEmail).not.toHaveBeenCalled();
  });


  it("should return the user when found by email and querySearch",async()=>{
    mockUserRepo.findOne?.mockResolvedValueOnce(userMockData);
    const email = 'test@gmail.com';
    const userFound = await service.findUserQuery(email);

    expect(mockUserRepo.findOne).toHaveBeenCalled();
    expect(userFound).toEqual(userMockData);
  });


  it("should throw NotFoundException if user is not found",async()=>{
    const email = 'test@gmail.com';
    await expect(service.findUserQuery(email)).rejects.toThrow(NotFoundException);

  expect(mockUserRepo.findOne).toHaveBeenCalledWith({ where: { email } });
  });


  it("should find an valid User by id",async()=>{
     const id ='uuid-1';
     const userFound = await service.findUserValidById(id);
     expect(mockUserRepo.findOneBy).toHaveBeenCalledWith({id});
     expect(userFound).toEqual(userMockData);

  });


  it("should throw UnauthorizedException if user exists but is inactive",async()=>{
    const id = 'uuid-1';
    mockUserRepo.findOneBy?.mockResolvedValueOnce({...userMockData,is_active:false});
    await expect(service.findUserValidById(id)).rejects.toThrow(UnauthorizedException);
    expect(mockUserRepo.findOneBy).toHaveBeenCalledWith({id});
  });






});
