import { Test, TestingModule } from '@nestjs/testing';
import { BookingModeService } from './booking-mode.service';

describe('BookingModeService', () => {
  let service: BookingModeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookingModeService],
    }).compile();

    service = module.get<BookingModeService>(BookingModeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
