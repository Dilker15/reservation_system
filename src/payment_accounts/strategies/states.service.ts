import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as crypto from 'crypto'
import { OAuthStates } from "../entities/oauth_states.entity";
import { Repository } from "typeorm";





@Injectable()
export class StatesService {

  constructor(@InjectRepository(OAuthStates)private readonly statesRepo:Repository<OAuthStates>){

  }


  async create(userId: string) {
    const random = crypto.randomBytes(16).toString('hex');
    const expires_at = new Date(Date.now() + 15 * 60 * 1000);

      await this.statesRepo.save({
        admin: { id: userId },
        state: random,
        expires_at,
      });

    return random;
  }



    async validate(state: string): Promise<string> {
      const record = await this.statesRepo.findOne({
        where: { state },
        relations: ['admin'],
      });
      if (!record) {
        throw new BadRequestException('Invalid state');
      }
      if (record.expires_at < new Date()) {
        throw new BadRequestException('State expired');
      }
      await this.statesRepo.delete(record.id);
      return record.admin.id;
    }

}