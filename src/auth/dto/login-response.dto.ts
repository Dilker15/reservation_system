import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsString,
  IsEmail,
  IsBoolean,
  IsEnum,
} from 'class-validator';

import { Roles } from 'src/common/Interfaces';

export class LoginResponseDto {

  @ApiProperty({ example: 'uuid-1234', description: 'User ID' })
  @IsUUID()
  id: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  last_name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ enum: Roles, example: Roles.OWNER })
  @IsEnum(Roles)
  role: Roles;

  @ApiProperty({ example: true })
  @IsBoolean()
  is_active: boolean;
}