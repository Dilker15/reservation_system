import { Test, TestingModule } from '@nestjs/testing';
import { BookingModeController } from './booking-mode.controller';
import { BookingModeService } from './booking-mode.service';

describe('BookingModeController', () => {
  let controller: BookingModeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingModeController],
      providers: [BookingModeService],
    }).compile();

    controller = module.get<BookingModeController>(BookingModeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
