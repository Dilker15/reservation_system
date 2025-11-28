import { BadRequestException, ConflictException, HttpException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { RegisterDto } from 'src/auth/dto/register-auth-dto';
import { BcryptService } from 'src/common/helpers/bcryp';
import { UserResponseDto } from './dto/user-response.dto';
import { GeneratorCodeService } from 'src/common/helpers/codeGenerator';
import { plainToInstance } from 'class-transformer';
import { EMAIL_TYPE, Roles } from 'src/common/Interfaces';
import { EnqueueMailServices } from 'src/queue-bull/enqueue-mail-services';
import { AppLoggerService } from 'src/logger/logger.service';
import { VerifyEmailDto } from 'src/auth/dto/verify-email.dto';

@Injectable()
export class UsersService {

  private logger:AppLoggerService;

  constructor(@InjectRepository(User) private readonly userRepository:Repository<User>,
              private readonly generatorCode:GeneratorCodeService,
              private readonly bcrypService:BcryptService,
              private readonly enqueMailService:EnqueueMailServices,
              private readonly appLogServ:AppLoggerService,
){
    this.logger = this.appLogServ.withContext(UsersService.name)
  }

  async create(createUserDto: RegisterDto,userRole:Roles):Promise<UserResponseDto> {
    const userFound = await this.userRepository.findOne({where:{email:createUserDto.email}});
    if(userFound){
      this.logger.warn("User with email not found : "+ createUserDto.email);
       throw new ConflictException(`User with email ${createUserDto.email} already exists`);
    }
    const passwordGenerated = await this.bcrypService.hashPassword(createUserDto.password);
    const codeGenerated = this.generatorCode.generate();
    const user = this.userRepository.create({...createUserDto,password:passwordGenerated,verification_code:codeGenerated,role:userRole});
    const userCreated = await this.userRepository.save(user);
    await this.enqueMailService.enqueEmail(EMAIL_TYPE.VERIFICATION_CODE,{to:userCreated.email,data:{code:codeGenerated}});
    this.logger.log("User created succesfully");
    return this.toUserResponse(userCreated);
  
  } 

  
  async findUserQuery(email:string,querySearch:FindOptionsWhere<User>={}):Promise<User>{
    let query = {
       where:{
        ...querySearch,
        email,
       }
    }
    const userFound = await this.userRepository.findOne(query);
    if(!userFound){
       this.logger.warn("User with email not found : "+ email);
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return userFound;
  }



  private toUserResponse(user:User):UserResponseDto{
    return plainToInstance(UserResponseDto,user,{excludeExtraneousValues:true});
  }


  async findUserValidById(id:string):Promise<User>{
    const user = await this.userRepository.findOneBy({id});
    if(!user || !user.is_active || !user.email_verified){
       this.logger.warn("User with id not found  : "+ id);
     throw new UnauthorizedException('User not found or inactive');

    }
    return user;
    
  }

async activateUser(verifyDto: VerifyEmailDto) {
  try {
    const user = await this.findUserQuery(verifyDto.email);
    if (user.verification_code !== verifyDto.verification_code || user.email_verified) {
      throw new BadRequestException(`Verify your email ${verifyDto.email} verification code`);
    }
    user.is_active = true;
    user.email_verified = true;
    await this.userRepository.save(user);
    return user;
  } catch (error) {
    if (error instanceof HttpException) {
      throw error;
    }
    this.logger.error(`Email Verification failed ${verifyDto.email}`,error?.stack || 'No stack trace');
    throw new InternalServerErrorException("Error on verifying your email");
  }
}




}
