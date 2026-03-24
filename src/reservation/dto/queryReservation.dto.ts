import { IsEnum, IsOptional } from "class-validator";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { RESERVATION_STATUS } from "src/common/Interfaces";
import { IsDateOnly } from "src/common/validators/onlydate.validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class QueryReservationDto extends PaginationDto {

  @ApiPropertyOptional({
    example: '2026-03-01',
    description: 'Start date filter (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateOnly()
  from?: string;

  @ApiPropertyOptional({
    example: '2026-03-31',
    description: 'End date filter (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateOnly()
  to?: string;

  @ApiPropertyOptional({
    enum: RESERVATION_STATUS,
    example: RESERVATION_STATUS.COMPLETED,
    description: 'Filter by reservation status',
  })
  @IsOptional()
  @IsEnum(RESERVATION_STATUS)
  status?: RESERVATION_STATUS;

}