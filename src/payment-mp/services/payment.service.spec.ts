import { Reservation } from "src/reservation/entities/reservation.entity";
import { PaymentStrategyFactory } from "../strategies/PaymentStrategyFactory";
import { Repository } from "typeorm";
import { PaymentIntent } from "../entities/payments.entity";
import { PROVIDERS, RESERVATION_STATUS } from "src/common/Interfaces";
import { Test, TestingModule } from "@nestjs/testing";
import { PaymentService } from "./payment.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { NotFoundException, BadRequestException, InternalServerErrorException } from "@nestjs/common";

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-123'),
}));

describe('PaymentService - createPayment', () => {
    
    let paymentService: PaymentService;
    let mockPaymentFactory: Partial<jest.Mocked<PaymentStrategyFactory>>;
    let mockReservationRepo: Partial<jest.Mocked<Repository<Reservation>>>;
    let mockPaymentIntentRepo: Partial<jest.Mocked<Repository<PaymentIntent>>>;
    let mockConfigService: jest.Mocked<ConfigService>;
    let mockStrategyCreatePayment: jest.Mock;
    
    const mockReservationData = {
        id: 'reservation-id',
        amount: 2,
        total_price: 100,
        place: {
            id: 'place-id',
            name: 'Amazing Place',
            description: 'A wonderful place to stay',
            owner: {
                id: 'owner-id',
                name: 'owner1',
                payment_accounts: [
                    {
                        id: 'payment-acc-1',
                        provider: PROVIDERS.MP
                    },
                    {
                        id: 'payment-acc-2',
                        provider: PROVIDERS.STRIPE,
                    }
                ]
            }
        }
    };

    const mockPreferenceData = {
        external_reference: 'mock-uuid-123',
        preference_id: 'preference-id-123',
        url: 'https://www.paymenturl.com/checkout'
    };

    beforeEach(async () => {
        mockStrategyCreatePayment = jest.fn().mockResolvedValue(mockPreferenceData);
        
        mockConfigService = {
            get: jest.fn((key: string) => {
                const config = {
                    'APP_URL': 'https://www.test.com',
                    'BACK_URL_FAILURE': 'https://www.test.com/failure',
                    'BACK_URL_PENDING': 'https://www.test.com/pending',
                    'BACK_URL_SUCCESS': 'https://www.test.com/success',
                };
                return config[key];
            }),
        } as any;

        mockReservationRepo = {
            findOne: jest.fn().mockResolvedValue(mockReservationData),
        };
     
        mockPaymentFactory = {
            getStretegy: jest.fn().mockReturnValue({
                createPayment: mockStrategyCreatePayment,
            }),
        };

        mockPaymentIntentRepo = {
            save: jest.fn().mockResolvedValue({
                id: 'payment-intent-id',
                external_reference: mockPreferenceData.external_reference,
                preference_id: mockPreferenceData.preference_id,
                preference_link: mockPreferenceData.url,
                provider: PROVIDERS.MP,
            }),
        };

        const serviceRef: TestingModule = await Test.createTestingModule({
            providers: [
                PaymentService,
                {
                    provide: PaymentStrategyFactory,
                    useValue: mockPaymentFactory,
                },
                {
                    provide: getRepositoryToken(Reservation),
                    useValue: mockReservationRepo,
                },
                {
                    provide: getRepositoryToken(PaymentIntent),
                    useValue: mockPaymentIntentRepo
                },
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                }
            ]
        }).compile();

        paymentService = serviceRef.get<PaymentService>(PaymentService);
    });

    describe('Happy Path', () => {
        it('should create payment intent with MercadoPago and return payment link', async () => {
            const reservationId = 'reservation-id';
            const provider = PROVIDERS.MP;

        
            const result = await paymentService.createPayment(reservationId, provider);

         
            expect(mockReservationRepo.findOne).toHaveBeenCalledWith({
                where: { id: reservationId, status: RESERVATION_STATUS.CREATED },
                relations: { place: { owner: { payment_accounts: true } } }
            });

       
            expect(mockPaymentFactory.getStretegy).toHaveBeenCalledWith(provider);
            expect(mockPaymentFactory.getStretegy).toHaveBeenCalledTimes(1);

            
            expect(mockStrategyCreatePayment).toHaveBeenCalledTimes(1);
            expect(mockStrategyCreatePayment).toHaveBeenCalledWith(
                {
                    provider: PROVIDERS.MP,
                    reservationId: mockReservationData.id,
                    amount: 200, 
                    currency: 'ARS',
                    items: [{
                        name: mockReservationData.place.name,
                        id: mockReservationData.id,
                        quantity: mockReservationData.amount,
                        unit_price: mockReservationData.total_price,
                        title: mockReservationData.place.name,
                        description: mockReservationData.place.description,
                    }],
                    metadata: {
                        reservationId: mockReservationData.id,
                    },
                    auto_return: "approved",
                    back_urls: {
                        failure: 'https://www.test.com/failure',
                        pending: 'https://www.test.com/pending',
                        success: 'https://www.test.com/success',
                    },
                    intent_id: 'mock-uuid-123',
                    notification_url: `https://www.test.com/api/v1/reservations/webhook/${PROVIDERS.MP}` // CORREGIDO
                },
                mockReservationData.place.owner.payment_accounts[0] 
            );

            expect(mockPaymentIntentRepo.save).toHaveBeenCalledWith({
                external_reference: mockPreferenceData.external_reference,
                preference_id: mockPreferenceData.preference_id,
                preference_link: mockPreferenceData.url,
                provider: provider,
                reservation: mockReservationData,
            });

    
            expect(result).toEqual({
                payment_link: mockPreferenceData.url,
                provider: PROVIDERS.MP,
                reservation: mockReservationData.id
            });
        });

        it('should create payment intent with Stripe and use USD currency', async () => {
           
            const reservationId = 'reservation-id';
            const provider = PROVIDERS.STRIPE;

        
            const result = await paymentService.createPayment(reservationId, provider);

            
            const callArgs = mockStrategyCreatePayment.mock.calls[0];
            expect(callArgs[0].currency).toBe('USD');
            expect(callArgs[0].notification_url).toBe(`https://www.test.com/api/v1/reservations/webhook/${PROVIDERS.STRIPE}`); // CORREGIDO
            
            
            expect(callArgs[1]).toEqual(mockReservationData.place.owner.payment_accounts[1]);
        });
    });

    describe('Error Cases', () => {
        it('should throw NotFoundException when reservation not found', async () => {
        
            mockReservationRepo.findOne = jest.fn().mockResolvedValue(null);

            
            await expect(
                paymentService.createPayment('non-existent-id', PROVIDERS.MP)
            ).rejects.toThrow(NotFoundException);
            await expect(
                paymentService.createPayment('non-existent-id', PROVIDERS.MP)
            ).rejects.toThrow("Reservation not found or payment already initiated/completed");
        });

        it('should throw NotFoundException when owner has no payment accounts', async () => {
          
            const reservationWithoutAccounts = {
                ...mockReservationData,
                place: {
                    ...mockReservationData.place,
                    owner: {
                        ...mockReservationData.place.owner,
                        payment_accounts: []
                    }
                }
            };
            mockReservationRepo.findOne = jest.fn().mockResolvedValue(reservationWithoutAccounts);

          
            await expect(
                paymentService.createPayment('reservation-id', PROVIDERS.MP)
            ).rejects.toThrow(NotFoundException);
            await expect(
                paymentService.createPayment('reservation-id', PROVIDERS.MP)
            ).rejects.toThrow("Payment method not found for this place");
        });

       
        it('should throw InternalServerErrorException when payment account for provider not found (BUG: should be BadRequestException)', async () => {
            
            const reservationOnlyMP = {
                ...mockReservationData,
                place: {
                    ...mockReservationData.place,
                    owner: {
                        ...mockReservationData.place.owner,
                        payment_accounts: [
                            {
                                id: 'payment-acc-1',
                                provider: PROVIDERS.MP
                            }
                        ]
                    }
                }
            };
            mockReservationRepo.findOne = jest.fn().mockResolvedValue(reservationOnlyMP);

            
            await expect(
                paymentService.createPayment('reservation-id', PROVIDERS.STRIPE)
            ).rejects.toThrow(InternalServerErrorException);
            await expect(
                paymentService.createPayment('reservation-id', PROVIDERS.STRIPE)
            ).rejects.toThrow(`Failed to create payment preference with provider ${PROVIDERS.STRIPE}.`);
        });

        it('should throw InternalServerErrorException when strategy.createPayment fails', async () => {
         
            mockStrategyCreatePayment.mockRejectedValue(new Error('API Error'));

            await expect(
                paymentService.createPayment('reservation-id', PROVIDERS.MP)
            ).rejects.toThrow(InternalServerErrorException);
            await expect(
                paymentService.createPayment('reservation-id', PROVIDERS.MP)
            ).rejects.toThrow(`Failed to create payment preference with provider ${PROVIDERS.MP}.`);
            
            expect(mockPaymentIntentRepo.save).not.toHaveBeenCalled();
        });
    });
});