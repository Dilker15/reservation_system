import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { GeneratorCodeService } from 'src/common/helpers/codeGenerator';
import { BcryptService } from 'src/common/helpers/bcryp';
import { QueueBullModule } from 'src/queue-bull/queue-bull.module';


@Module({
  controllers: [UsersController],
  imports:[TypeOrmModule.forFeature([User]),QueueBullModule],
  providers: [UsersService,GeneratorCodeService,BcryptService],
  exports:[UsersService]
})
export class UsersModule {}
