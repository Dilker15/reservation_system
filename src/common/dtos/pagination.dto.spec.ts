import 'reflect-metadata';
import { PaginationDto } from './pagination.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

describe('PaginationDto', () => {

  it('should pass with all valid values', async () => {
    const dto = plainToInstance(PaginationDto, {
      limit: 50,
      page: 2,
      category: '550e8400-e29b-41d4-a716-446655440000',
      city: '550e8400-e29b-41d4-a716-446655440000',
      reservation_mode: '550e8400-e29b-41d4-a716-446655440000',
      min_price: 10,
      max_price: 1000
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should allow empty DTO', async () => {
    const dto = plainToInstance(PaginationDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if limit is negative', async () => {
    const dto = plainToInstance(PaginationDto, { limit: -5 });
    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'limit')).toBe(true);
  });

  it('should fail if limit is greater than 100', async () => {
    const dto = plainToInstance(PaginationDto, { limit: 101 });
    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'limit')).toBe(true);
    expect(errors.find(e => e.property === 'limit')?.constraints).toHaveProperty('max');
  });

  it('should fail if page is zero', async () => {
    const dto = plainToInstance(PaginationDto, { page: 0 });
    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'page')).toBe(true);
  });

});
