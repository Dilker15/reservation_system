import { Test, TestingModule } from '@nestjs/testing';
import { OpeningHoursController } from './opening-hours.controller';
import { OpeningHoursService } from './opening-hours.service';

describe('OpeningHoursController', () => {
  let controller: OpeningHoursController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpeningHoursController],
      providers: [OpeningHoursService],
    }).compile();

    controller = module.get<OpeningHoursController>(OpeningHoursController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
