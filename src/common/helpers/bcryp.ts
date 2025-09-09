

import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptService {

    private readonly saltRounds:number=12;


    async hashPassword(password:string):Promise<string>{
       return bcrypt.hash(password,this.saltRounds);
    }


    async verifyPassword(password:string,hashedPassword:string):Promise<boolean>{
        return bcrypt.compare(password,hashedPassword);  
    }
}