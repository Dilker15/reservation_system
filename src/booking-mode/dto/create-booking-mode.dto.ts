import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingName, BookingModeType } from 'src/common/Interfaces';

export class CreateBookingModeDto {

  @ApiProperty({
    enum: BookingName,
    example: BookingName.PER_HOUR,
    description: 'Booking name type',
  })
  @IsEnum(BookingName, { message: 'Booking name is not correct' })
  name: BookingName;

  @ApiProperty({
    enum: BookingModeType,
    example: BookingModeType.HOURLY,
    description: 'Booking mode type',
  })
  @IsEnum(BookingModeType, { message: 'Mode is not correct' })
  type: BookingModeType;

  @ApiPropertyOptional({
    example: 'Booking per day',
    description: 'Optional description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 1,
    description: 'Minimum duration (must be greater than 0)',
  })
  @IsNumber()
  @Min(1, { message: 'Minimum duration must be greater than 0' })
  min_duration: number;
}