import { ApiProperty } from '@nestjs/swagger';
import { Roles } from 'src/common/Interfaces';

export class LoginResponseDto {

  @ApiProperty({ example: 'uuid-1234', description: 'User ID' })
  id: string;

  @ApiProperty({ example: 'John' })
  name: string;

  @ApiProperty({ example: 'Doe' })
  last_name: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ enum: Roles, example: Roles.OWNER })
  role: Roles;

  @ApiProperty({ example: true })
  is_active: boolean;

}