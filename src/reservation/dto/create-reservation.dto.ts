import { Transform, Type } from "class-transformer";
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  Min
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateReservationDto {

  private static readonly TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d):00$/;

  @ApiProperty({
    example: '2026-03-25',
    description: 'Reservation start date (YYYY-MM-DD)',
  })
  @IsDateString()
  reservation_start_date: string;

  @ApiPropertyOptional({
    example: '2026-03-26',
    description: 'Reservation end date (YYYY-MM-DD)',
  })
  @IsDateString()
  @IsOptional()
  reservation_end_date?: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Place ID',
  })
  @IsUUID()
  place_id: string;

  @ApiPropertyOptional({
    example: '10:00',
    description: 'Start time (HH:mm) → internally transformed to HH:mm:00',
  })
  @IsString()
  @IsOptional()
  @Transform(
    ({ value }) => value ? `${value}:00` : value,
    { toClassOnly: true }
  )
  @Matches(CreateReservationDto.TIME_REGEX, {
    message: 'start time must be in HH:mm: format (00:00 - 23:59)',
  })
  start_time?: string;

  @ApiPropertyOptional({
    example: '12:00',
    description: 'End time (HH:mm) → internally transformed to HH:mm:00',
  })
  @IsString()
  @IsOptional()
  @Transform(
    ({ value }) => value ? `${value}:00` : value,
    { toClassOnly: true }
  )
  @Matches(CreateReservationDto.TIME_REGEX, {
    message: 'end time must be in HH:mm: format (00:00 - 23:59)',
  })
  end_time?: string;

  @ApiPropertyOptional({
    example: 3,
    description: 'Day of the week (1 = Monday, 7 = Sunday)',
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(7)
  reservation_day?: number;
}