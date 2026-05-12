import { Test, TestingModule } from '@nestjs/testing';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';

describe('ReservationController', () => {
  let controller: ReservationController;
  let service: ReservationService;

  const mockReservationService = {
    create: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationController],
      providers: [
        {
          provide: ReservationService,
          useValue: mockReservationService,
        },
      ],
    }).compile();

    controller = module.get<ReservationController>(ReservationController);
    service = module.get<ReservationService>(ReservationService);
  });

  it('should create a reservation', async () => {
    const dto = { date: '2026-01-01' } as any;
    const user = { id: 1 } as any;

    mockReservationService.create.mockResolvedValue('ok');

    const result = await controller.create(dto, user);

    expect(service.create).toHaveBeenCalledWith(dto, user);
    expect(result).toBe('ok');
  });
});
