import { BookingMode } from "src/booking-mode/entities/booking-mode.entity";
import { BookingModeType, BookingName } from "src/common/Interfaces";

export const bookingModesData: Partial<BookingMode>[] = [
  {
    name: BookingName.PER_HOUR,
    type: BookingModeType.HOURLY,
    description: "Booking per hour basis",
    min_duration: 1,
    is_active: true,
  },
  {
    name: BookingName.PER_DAY,
    type: BookingModeType.DAILY,
    description: "Booking per day basis",
    min_duration: 1,
    is_active: true,
  },
  {
    name: BookingName.PER_WEEK,
    type: BookingModeType.WEEKLY,
    description: "Booking per week basis",
    min_duration: 1,
    is_active: true,
  },
  {
    name: BookingName.PER_MONTH,
    type: BookingModeType.MONTHLY,
    description: "Booking per month basis",
    min_duration: 1,
    is_active: true,
  },
];
