import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DisconnectPaymentAccountDto {

  @ApiProperty({
    example: 'Password123',
    description: 'User password to confirm account disconnection',
    minLength: 7,
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(7, { message: 'Password must be at least 6 characters' })
  password: string;

}