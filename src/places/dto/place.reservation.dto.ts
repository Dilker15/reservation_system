import { IsOptional } from "class-validator";
import { IsDateOnly } from "src/common/validators/onlydate.validator";

export class GetPlaceReservationsQueryDto {
    @IsOptional()
    @IsDateOnly({ message: 'date must be a valid YYYY-MM-DD date' })
    date: string;
  }