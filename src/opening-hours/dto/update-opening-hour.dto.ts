import { IsNumber, IsOptional, IsString, IsUUID, Matches, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateOpeningHourDto {

  private static readonly TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;


  @IsUUID()
  place_id: string;




  @IsString()
  @Matches(UpdateOpeningHourDto.TIME_REGEX, {
    message: 'open_time must be in HH:mm format (00:00 - 23:59)',
  })
  open_time: string;


  @IsString()
  @Matches(UpdateOpeningHourDto.TIME_REGEX, {
    message: 'close_time must be in HH:mm format (00:00 - 23:59)',
  })
  close_time: string;
}
