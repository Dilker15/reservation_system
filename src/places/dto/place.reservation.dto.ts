import { IsDateOnly } from "src/common/validators/onlydate.validator";

export class GetPlaceReservationsQueryDto {
    @IsDateOnly({ message: 'date must be a valid YYYY-MM-DD date' })
    date: string;
  }