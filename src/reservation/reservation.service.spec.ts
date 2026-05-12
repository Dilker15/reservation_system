import { Test, TestingModule } from '@nestjs/testing';
import { ReservationService } from './reservation.service';
import { PlacesService } from 'src/places/places.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { Repository, DataSource } from 'typeorm';
import { BookingStrategyFactory } from './strategies/BookingStrategyFactory';
import { InternalServerErrorException } from '@nestjs/common';
import { RESERVATION_STATUS } from 'src/common/Interfaces';

describe('ReservationService', () => {
  let service: ReservationService;

  const mockPlaceService = {
    findOne: jest.fn(),
  };

  const mockStrategy = {
    validateDto: jest.fn(),
    validateBusiness: jest.fn(),
    ensureAvailability: jest.fn(),
    calculateAmount: jest.fn(),
    buildReservation: jest.fn(),
  };

  const mockStrategyFactory = {
    getStrategy: jest.fn().mockReturnValue(mockStrategy),
  };

  const mockReservationRepo = {
    save: jest.fn(),
    findOneBy: jest.fn(),
  };

  const mockManager = {
    getRepository: jest.fn().mockReturnValue(mockReservationRepo),
  };

  const mockDataSource = {
    transaction: jest.fn(async (cb) => cb(mockManager)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationService,
        { provide: PlacesService, useValue: mockPlaceService },
        { provide: BookingStrategyFactory, useValue: mockStrategyFactory },
        { provide: DataSource, useValue: mockDataSource },
        {
          provide: getRepositoryToken(Reservation),
          useValue: mockReservationRepo,
        },
      ],
    }).compile();

    service = module.get<ReservationService>(ReservationService);

    jest.clearAllMocks();
  });



  describe('create()', () => {
    const dto = { place_id: 'place-1' } as any;
    const client = { id: 'user-1' } as any;

    const place = {
      id: 'place-1',
      booking_mode: { type: 'PER_DAY' },
      price: 100,
    };

    it('should create reservation successfully', async () => {
      const reservationEntity = {
        id: 'res-1',
        user: client,
        status: RESERVATION_STATUS.CREATED,
      };

      mockPlaceService.findOne.mockResolvedValue(place);
      mockStrategy.calculateAmount.mockReturnValue(200);
      mockStrategy.buildReservation.mockReturnValue(reservationEntity);
      mockReservationRepo.save.mockResolvedValue(reservationEntity);

      const result = await service.create(dto, client);


      expect(mockStrategyFactory.getStrategy).toHaveBeenCalledWith('PER_DAY');

 
      expect(mockStrategy.validateDto).toHaveBeenCalledWith(dto);
      expect(mockStrategy.validateBusiness).toHaveBeenCalledWith(place, dto);

      
      expect(mockStrategy.ensureAvailability).toHaveBeenCalled();
      expect(mockStrategy.calculateAmount).toHaveBeenCalledWith(dto);
      expect(mockStrategy.buildReservation).toHaveBeenCalled();


      expect(result.reservation.user).toBeUndefined();
      expect(result.reservation.status).toBe(RESERVATION_STATUS.CREATED);
    });


    it('should rethrow business exception', async () => {
      mockPlaceService.findOne.mockResolvedValue(place);
      mockStrategy.validateBusiness.mockImplementation(() => {
        throw { status: 400, response: 'business error' };
      });

      await expect(service.create(dto, client)).rejects.toEqual(
        expect.objectContaining({ status: 400 }),
      );
    });
  });



  describe('reservationIsPaid()', () => {
    it('should return true if reservation is paid', async () => {
      mockReservationRepo.findOneBy.mockResolvedValue({ id: 'res-1' });

      const result = await service.reservationIsPaid('res-1');

      expect(result).toBe(true);
      expect(mockReservationRepo.findOneBy).toHaveBeenCalledWith({
        id: 'res-1',
        status: RESERVATION_STATUS.PAID,
      });
    });

    it('should return false if reservation is not paid', async () => {
      mockReservationRepo.findOneBy.mockResolvedValue(null);

      const result = await service.reservationIsPaid('res-1');

      expect(result).toBe(false);
    });
  });
});
