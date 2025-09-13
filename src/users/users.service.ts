import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class UsersService {

  constructor(@InjectRepository(User) private readonly userRepository:Repository<User>,
              private readonly generatorCode:GeneratorCodeService,
              private readonly bcrypService:BcryptService,
              private readonly enqueMailService:EnqueueMailServices,
){

  }

  async create(createUserDto: RegisterDto,userRole:Roles):Promise<UserResponseDto> {
    const userFound = await this.userRepository.findOne({where:{email:createUserDto.email}});
    if(userFound){
       throw new ConflictException(`User with email ${createUserDto.email} already exists`);
    }
    const passwordGenerated = await this.bcrypService.hashPassword(createUserDto.password);
    const codeGenerated = this.generatorCode.generate();
    const user = this.userRepository.create({...createUserDto,password:passwordGenerated,verification_code:codeGenerated,role:userRole});
    const userCreated = await this.userRepository.save(user);
    await this.enqueMailService.enqueEmail(EMAIL_TYPE.VERIFICATION_CODE,{to:userCreated.email,data:{code:codeGenerated}});
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
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return userFound;
  }



  private toUserResponse(user:User):UserResponseDto{
    return plainToInstance(UserResponseDto,user,{excludeExtraneousValues:true});
  }





}
