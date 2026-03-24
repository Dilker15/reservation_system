import { IsInt, IsString, Matches, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AvailabilityDto {

  @ApiProperty({
    example: 1,
    description: 'Day of the week (1 = Monday, 7 = Sunday)',
    minimum: 1,
    maximum: 7,
  })
  @IsInt()
  @Min(1)
  @Max(7)
  day: number;

  @ApiProperty({
    example: '08:00',
    description: 'Opening time in HH:mm format (00:00 - 23:59)',
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'open_time must be in format HH:mm (00:00 - 23:59)',
  })
  open_time: string;

  @ApiProperty({
    example: '18:00',
    description: 'Closing time in HH:mm format (00:00 - 23:59)',
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'close_time must be in format HH:mm (00:00 - 23:59)',
  })
  close_time: string;
}