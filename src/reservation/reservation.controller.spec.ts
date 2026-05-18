import { Test, TestingModule } from '@nestjs/testing';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import { Roles } from 'src/common/Interfaces';
import { User } from 'src/users/entities/user.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { QueryReservationDto } from './dto/queryReservation.dto';
import { IdempotencyInterceptor } from 'src/common/interceptors/idempotency.interceptor';

describe('ReservationController', () => {

  let controller: ReservationController;
  let service: jest.Mocked<ReservationService>;

  const mockReservationService = {
    create: jest.fn(),
    getReservationsList: jest.fn(),
    getPaymentInfo: jest.fn(),
    getReservationById: jest.fn(),
    cancelReservation: jest.fn(),
  };

  const mockClient: User = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'client@test.com',
    role: Roles.CLIENT,
  } as User;

  const mockOwner: User = {
    id: '660e8400-e29b-41d4-a716-446655440000',
    email: 'owner@test.com',
    role: Roles.OWNER,
  } as User;

  beforeEach(async () => {

    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationController],
      providers: [
        {
          provide: ReservationService,
          useValue: mockReservationService,
        },
      ],
    })
      .overrideInterceptor(IdempotencyInterceptor)
      .useValue({
        intercept: jest.fn((context, next) => next.handle()),
      })
      .compile();

    controller = module.get<ReservationController>(
      ReservationController,
    );

    service = module.get(
      ReservationService,
    ) as jest.Mocked<ReservationService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {

    it('should create reservation successfully', async () => {

      const dto: CreateReservationDto = {
      } as CreateReservationDto;

      const response = {
        id: 'reservation_1',
        success: true,
      };

      service.create.mockResolvedValue(response as any);

      const result = await controller.create(
        dto,
        mockClient,
      );

      expect(service.create).toHaveBeenCalledTimes(1);

      expect(service.create).toHaveBeenCalledWith(
        dto,
        mockClient,
      );

      expect(result).toEqual(response);
    });

    it('should propagate create errors', async () => {

      const dto: CreateReservationDto = {} as CreateReservationDto;

      service.create.mockRejectedValue(
        new Error('Reservation creation failed'),
      );

      await expect(
        controller.create(dto, mockClient),
      ).rejects.toThrow(
        'Reservation creation failed',
      );

      expect(service.create).toHaveBeenCalledTimes(1);
    });

  });

  describe('getReservations', () => {

    it('should return reservations list', async () => {

      const query: QueryReservationDto = {
        page: 1,
        limit: 10,
      } as QueryReservationDto;

      const reservations = [
        {
          id: 'reservation_1',
        },
        {
          id: 'reservation_2',
        },
      ];

      service.getReservationsList.mockResolvedValue(
        reservations as any,
      );

      const result = await controller.getReservations(
        mockOwner,
        query,
      );

      expect(
        service.getReservationsList,
      ).toHaveBeenCalledTimes(1);

      expect(
        service.getReservationsList,
      ).toHaveBeenCalledWith(
        mockOwner,
        query,
      );

      expect(result).toEqual(reservations);
    });

    it('should propagate getReservations errors', async () => {

      const query: QueryReservationDto = {} as QueryReservationDto;

      service.getReservationsList.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        controller.getReservations(
          mockOwner,
          query,
        ),
      ).rejects.toThrow('Database error');
    });

  });

  describe('getReservationPaymentInfo', () => {

    it('should return payment info', async () => {

      const paymentInfo = {
        payment_intent: 'pi_123',
      };

      service.getPaymentInfo.mockResolvedValue(
        paymentInfo as any,
      );

      const result =
        await controller.getReservationPaymentInfo(
          '550e8400-e29b-41d4-a716-446655440000',
          mockClient,
        );

      expect(service.getPaymentInfo).toHaveBeenCalledTimes(1);

      expect(service.getPaymentInfo).toHaveBeenCalledWith(
        '550e8400-e29b-41d4-a716-446655440000',
        mockClient,
      );

      expect(result).toEqual(paymentInfo);
    });

    it('should propagate payment info errors', async () => {

      service.getPaymentInfo.mockRejectedValue(
        new Error('Reservation not found'),
      );

      await expect(
        controller.getReservationPaymentInfo(
          '550e8400-e29b-41d4-a716-446655440000',
          mockClient,
        ),
      ).rejects.toThrow('Reservation not found');
    });

  });

  describe('getReservation', () => {

    it('should return reservation by id', async () => {

      const reservation = {
        id: 'reservation_1',
      };

      service.getReservationById.mockResolvedValue(
        reservation as any,
      );

      const result = await controller.getReservation(
        '550e8400-e29b-41d4-a716-446655440000',
        mockOwner,
      );

      expect(
        service.getReservationById,
      ).toHaveBeenCalledTimes(1);

      expect(
        service.getReservationById,
      ).toHaveBeenCalledWith(
        '550e8400-e29b-41d4-a716-446655440000',
        mockOwner,
      );

      expect(result).toEqual(reservation);
    });

    it('should propagate reservation by id errors', async () => {

      service.getReservationById.mockRejectedValue(
        new Error('Reservation does not exist'),
      );

      await expect(
        controller.getReservation(
          '550e8400-e29b-41d4-a716-446655440000',
          mockOwner,
        ),
      ).rejects.toThrow(
        'Reservation does not exist',
      );
    });

  });

  describe('cancelReservation', () => {

    it('should cancel reservation successfully', async () => {

      const response = {
        success: true,
        message: 'Reservation canceled',
      };

      service.cancelReservation.mockResolvedValue(
        response as any,
      );

      const result = await controller.cancelReservation(
        '550e8400-e29b-41d4-a716-446655440000',
        mockClient,
      );

      expect(
        service.cancelReservation,
      ).toHaveBeenCalledTimes(1);

      expect(
        service.cancelReservation,
      ).toHaveBeenCalledWith(
        '550e8400-e29b-41d4-a716-446655440000',
        mockClient,
      );

      expect(result).toEqual(response);
    });

    it('should propagate cancel reservation errors', async () => {

      service.cancelReservation.mockRejectedValue(
        new Error('Reservation already canceled'),
      );

      await expect(
        controller.cancelReservation(
          '550e8400-e29b-41d4-a716-446655440000',
          mockClient,
        ),
      ).rejects.toThrow(
        'Reservation already canceled',
      );
    });

  });

});