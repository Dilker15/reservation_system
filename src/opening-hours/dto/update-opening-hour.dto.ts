import { IsString, IsUUID, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOpeningHourDto {

  private static readonly TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

  @ApiProperty({
    example: 'uuid',
    description: 'Place ID associated with the opening hour',
  })
  @IsUUID()
  place_id: string;

  @ApiProperty({
    example: '08:00',
    description: 'Opening time in HH:mm format (00:00 - 23:59)',
  })
  @IsString()
  @Matches(UpdateOpeningHourDto.TIME_REGEX, {
    message: 'open_time must be in HH:mm format (00:00 - 23:59)',
  })
  open_time: string;

  @ApiProperty({
    example: '18:00',
    description: 'Closing time in HH:mm format (00:00 - 23:59)',
  })
  @IsString()
  @Matches(UpdateOpeningHourDto.TIME_REGEX, {
    message: 'close_time must be in HH:mm format (00:00 - 23:59)',
  })
  close_time: string;
}