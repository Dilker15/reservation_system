import { IsInt, IsString, Matches, Max, Min } from 'class-validator';

export class AvailabilityDto {
  @IsInt()
  @Min(1)
  @Max(7)
  day: number;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'open_time must be in format HH:mm (00:00 - 23:59)',
  })
  open_time: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'close_time must be in format HH:mm (00:00 - 23:59)',
  })
  close_time: string;
}
