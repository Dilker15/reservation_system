import { PartialType } from '@nestjs/swagger';
import { CreateBookingModeDto } from './create-booking-mode.dto';

export class UpdateBookingModeDto extends PartialType(CreateBookingModeDto) {}
