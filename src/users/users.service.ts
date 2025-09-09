import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { RegisterDto } from 'src/auth/dto/register-auth-dto';
import { BcryptService } from 'src/common/helpers/bcryp';
import { UserResponseDto } from './dto/user-response.dto';
import { GeneratorCodeService } from 'src/common/helpers/codeGenerator';
import { plainToInstance } from 'class-transformer';
import e from 'express';
import { Roles } from 'src/common/Interfaces';

@Injectable()
export class UsersService {

  constructor(@InjectRepository(User) private readonly userRepository:Repository<User>,
              private readonly generatorCode:GeneratorCodeService,
              private readonly bcrypService:BcryptService,
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
    const userCreated = await this.userRepository.save(user)
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
