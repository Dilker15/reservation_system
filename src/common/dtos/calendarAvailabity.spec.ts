import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CalendarAvailabityDto } from './calendarAvailabity'

describe('CalendarAvailabityDto', () => {

  it('should pass with valid ISO date strings', async () => {
    const dto = plainToInstance(CalendarAvailabityDto, {
      start_date: '2026-01-08',
      end_date: '2026-12-31'
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should allow empty DTO', async () => {
    const dto = plainToInstance(CalendarAvailabityDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if start_date is not a valid date string', async () => {
    const dto = plainToInstance(CalendarAvailabityDto, {
      start_date: 'not-a-date'
    });

    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'start_date')).toBe(true);
  });

  it('should fail if end_date is not a valid date string', async () => {
    const dto = plainToInstance(CalendarAvailabityDto, {
      end_date: '2026-13-01' // invalid month
    });

    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'end_date')).toBe(true);
  });

  it('should fail if start_date or end_date are invalid formats', async () => {
    const dto = plainToInstance(CalendarAvailabityDto, {
      start_date: '01/08/2026',
      end_date: '31-12-2026'
    });

    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'start_date')).toBe(true);
    expect(errors.some(e => e.property === 'end_date')).toBe(true);
  });

});
