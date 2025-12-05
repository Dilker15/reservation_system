import { Transform, Type } from "class-transformer";
import { IsDateString, IsNumber, IsOptional, IsString, IsUUID, Matches, Max, Min } from "class-validator";

export class CreateReservationDto {
    private static readonly TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d):00$/; // Actualizado para validar HH:mm:00

    @IsDateString()
    reservation_start_date: string;

    @IsDateString()
    @IsOptional()
    reservation_end_date?: string;

    @IsUUID()
    place_id: string;

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

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    @Min(1)
    @Max(7)
    reservation_day?: number;
}