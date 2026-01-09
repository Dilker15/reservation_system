import { MercadoPagoWebhookGuard } from './mercado-pago-webhook-guards';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ExecutionContext } from '@nestjs/common';

describe('MercadoPagoWebhookGuard', () => {

  let webhookGuard: MercadoPagoWebhookGuard;

  let configServiceMock: Partial<jest.Mocked<ConfigService>> = {
    get: jest.fn(),
  };

  let httpRequestMock: any;

  const createExecutionContextMock = (): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => httpRequestMock,
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext);

  beforeEach(async () => {
    httpRequestMock = {
      body: {
        action: 'payment.created',
      },
      headers: {
        'x-signature': 'ts=123,v1=abc',
        'x-request-id': 'mock-request-id',
      },
      _parsedUrl: {
        query: 'data.id=999',
      },
    };

    const testingModule: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
        MercadoPagoWebhookGuard,
      ],
    }).compile();

    webhookGuard = testingModule.get<MercadoPagoWebhookGuard>(
      MercadoPagoWebhookGuard,
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(webhookGuard).toBeDefined();
  });

  it('should return false when action is missing or invalid', () => {
    httpRequestMock.body.action = 'payment.data';

    const result = webhookGuard.canActivate(createExecutionContextMock());

    expect(result).toBe(false);
  });

  it('should return false when signature validation fails', () => {
    jest
      .spyOn(webhookGuard as any, 'validateSignature')
      .mockReturnValueOnce(false);

    const result = webhookGuard.canActivate(createExecutionContextMock());

    expect(result).toBe(false);
  });

  it('should return true when webhook signature is valid', () => {
    const validateSignatureSpy = jest
      .spyOn(webhookGuard as any, 'validateSignature')
      .mockReturnValue(true);

    const result = webhookGuard.canActivate(createExecutionContextMock());

    expect(validateSignatureSpy).toHaveBeenCalled();
    expect(result).toBe(true);
  });
});
