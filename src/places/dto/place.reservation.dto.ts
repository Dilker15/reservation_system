import { IsOptional } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateOnly } from "src/common/validators/onlydate.validator";

export class GetPlaceReservationsQueryDto {

  @ApiPropertyOptional({
    example: '2026-03-20',
    description: 'Filter reservations by date (format: YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateOnly({ message: 'date must be a valid YYYY-MM-DD date' })
  date: string;

}