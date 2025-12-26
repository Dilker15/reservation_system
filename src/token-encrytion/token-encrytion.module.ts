import { Module } from '@nestjs/common';
import { TokenEncrytionService } from './token-encrytion.service';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports:[ConfigModule],
  providers: [TokenEncrytionService],
  exports:[TokenEncrytionService],
})
export class TokenEncrytionModule {}
