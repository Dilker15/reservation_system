import { Test, TestingModule } from '@nestjs/testing';
import { WebHookService } from './webhook.service';
import { PaymentStrategyFactory } from '../strategies/PaymentStrategyFactory';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PaymentIntent } from '../entities/payments.entity';
import { Repository, DataSource } from 'typeorm';
import { EnqueueMailServices } from 'src/queue-bull/enqueue-mail-services';
import { ParserNotificationData } from 'src/common/helpers/parserNotificationData';
import { AppLoggerService } from 'src/logger/logger.service';
import { ReservationService } from 'src/reservation/reservation.service';
import {
  PAYMENTS_STATUS,
  PROVIDERS,
  RESERVATION_STATUS,
} from 'src/common/Interfaces';
import { PaymentEvent } from '../interfaces/create.payment';

describe('WebHookService', () => {
  let service: WebHookService;
  let paymentIntentRepo: Repository<PaymentIntent>;
  let paymentFactory: PaymentStrategyFactory;
  let reservationService: ReservationService;
  let dataSource: DataSource;
  let enqueNotifications: EnqueueMailServices;

  const baseEvent: PaymentEvent = {
    provider: PROVIDERS.MP,
    eventType: 'payment_succeeded',
    providerEventId: 'evt_1',
    paymentId: 'pay_1',
    payload: {},
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebHookService,
        {
          provide: PaymentStrategyFactory,
          useValue: {
            getStretegy: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(PaymentIntent),
          useValue: {
            findOneBy: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn(),
          },
        },
        {
          provide: EnqueueMailServices,
          useValue: {
            enqueEmail: jest.fn(),
          },
        },
        {
          provide: ParserNotificationData,
          useValue: {
            parserNotificationConfirm: jest.fn(),
          },
        },
        {
          provide: AppLoggerService,
          useValue: {
            withContext: jest.fn().mockReturnValue({
              log: jest.fn(),
              warn: jest.fn(),
              error: jest.fn(),
            }),
          },
        },
        {
          provide: ReservationService,
          useValue: {
            reservationIsPaid: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(WebHookService);
    paymentIntentRepo = module.get(getRepositoryToken(PaymentIntent));
    paymentFactory = module.get(PaymentStrategyFactory);
    reservationService = module.get(ReservationService);
    dataSource = module.get(DataSource);
    enqueNotifications = module.get(EnqueueMailServices);
  });

  it('should return if paymentId is missing', async () => {
    await service.processEvent({
      ...baseEvent,
      paymentId: undefined as any,
    });

    expect(paymentIntentRepo.findOneBy).not.toHaveBeenCalled();
  });

  it('should return if payment was already processed', async () => {
    jest.spyOn(paymentIntentRepo, 'findOneBy').mockResolvedValue({} as PaymentIntent);

    await service.processEvent(baseEvent);

    expect(paymentIntentRepo.findOneBy).toHaveBeenCalledWith({
      payment_id: baseEvent.paymentId,
    });
  });

  it('should process payment and notify', async () => {
    jest.spyOn(paymentIntentRepo, 'findOneBy').mockResolvedValue(null);

    const verifyPaymentMock = jest.fn().mockResolvedValue({
      paymentId: baseEvent.paymentId,
      reservationId: 'res_1',
      external_reference: 'ext_1',
      amount: 100,
      currency: 'USD',
      feeAmount: 10,
      payerEmail: 'test@mail.com',
      payerId: 'payer_1',
      paymentMethod: 'card',
      destinationAccount: 'acc_1',
    });

    (paymentFactory.getStretegy as jest.Mock).mockReturnValue({
      verifyPayment: verifyPaymentMock,
    });

    jest.spyOn(reservationService, 'reservationIsPaid').mockResolvedValue(false);

    const fakePayment = {
      id: 'pi_1',
      status: PAYMENTS_STATUS.PENDING,
      reservation: {
        id: 'res_1',
        status: RESERVATION_STATUS.CREATED,
        user: {},
        place: {
          owner: { email: 'owner@mail.com' },
        },
      },
    };

    (dataSource.transaction as jest.Mock).mockImplementation(async (cb) => {
      const manager = {
        findOne: jest
          .fn()
          .mockResolvedValueOnce(fakePayment)
          .mockResolvedValueOnce(fakePayment),
        save: jest.fn().mockResolvedValue(fakePayment),
      };
      return cb(manager);
    });

    await service.processEvent(baseEvent);

    expect(verifyPaymentMock).toHaveBeenCalledWith(baseEvent.paymentId);
    expect(enqueNotifications.enqueEmail).toHaveBeenCalledTimes(2);
  });
});
