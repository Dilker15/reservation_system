import { User } from "src/users/entities/user.entity";
import { ParserNotificationData } from "./parserNotificationData";
import { BookingModeType } from "../Interfaces";
import { Place } from "src/places/entities/place.entity";
import { Reservation } from "src/reservation/entities/reservation.entity";


describe('ParserNotificationData', () => {
  let parser: ParserNotificationData;

  beforeEach(() => {
    parser = new ParserNotificationData();
  });

  it('should return DAILY reservation data with hours and same start/end date', () => {
    const reservationStart = new Date();

    const client = { name: 'dcp' } as any;

    const reservation = {
      start_time: '20:20',
      end_time: '21:00',
      reservation_start_date: reservationStart,
    } as any;

    const place = {
      name: 'place-test',
      booking_mode: { type: BookingModeType.DAILY },
    } as any;

    const result = parser.parserNotificationConfirm(client, reservation, place);

    expect(result).toEqual(
      expect.objectContaining({
        clientName: 'dcp',
        placeName: 'place-test',
        reservationStart: reservationStart,
        reservationEnd: reservationStart,
        startHour: '20:20',
        endHour: '21:00',
      }),
    );
  });

  it('should return reservationEnd from reservation_end_date when booking mode is NOT DAILY', () => {
    const reservationStart = new Date();
    const reservationEnd = new Date();

    const client = { name: 'dcp' } as any;

    const reservation = {
      reservation_start_date: reservationStart,
      reservation_end_date: reservationEnd,
    } as any;

    const place = {
      name: 'place-test',
      booking_mode: { type: BookingModeType.MONTHLY },
    } as any;

    const result = parser.parserNotificationConfirm(client, reservation, place);

    expect(result).toEqual(
      expect.objectContaining({
        clientName: 'dcp',
        placeName: 'place-test',
        reservationStart: reservationStart,
        reservationEnd: reservationEnd,
      }),
    );

    expect(result.startHour).toBeUndefined();
    expect(result.endHour).toBeUndefined();
  });
});
