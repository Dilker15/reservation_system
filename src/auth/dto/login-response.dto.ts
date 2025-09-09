import { IsUUID, IsString, IsEmail, IsEnum, IsBoolean } from 'class-validator';
import { Roles } from 'src/common/Interfaces';

export class LoginResponseDto {

  
  @IsUUID()
  id: string;

  @IsString()
  name: string;

  @IsString()
  last_name: string;

  @IsEmail()
  email: string;

  @IsEnum(Roles)
  role: Roles;

  @IsBoolean()
  is_active: boolean;

  @IsString()
  token: string;
}
