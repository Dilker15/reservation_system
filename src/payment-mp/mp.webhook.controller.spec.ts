
import { Test, TestingModule } from "@nestjs/testing";
import { MercadoPagoWebHookController } from "./mp.webhook.controller";
import { WebHookService } from "./services/webhook.service";
import { MpEventAdapter } from "./adapters/mp.event.adater";
import { ConfigService } from "@nestjs/config";

describe("MercadoPagoWebHookController", () => {
  let controller: MercadoPagoWebHookController;
  let mockService: Partial<jest.Mocked<WebHookService>>;
  let adaptSpy: jest.SpyInstance;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockService = {
      processEvent: jest.fn(),
    };

    adaptSpy = jest
      .spyOn(MpEventAdapter, "adapt")
      .mockReturnValue({
        provider: "MERCADO_PAGO",
        eventType: "payment_succeeded",
        providerEventId: "mp-event-id",
      } as any);

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [MercadoPagoWebHookController],
      providers: [
        {
          provide: WebHookService,
          useValue: mockService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = moduleRef.get<MercadoPagoWebHookController>(
      MercadoPagoWebHookController
    );
  });

  afterEach(() => {
    adaptSpy.mockRestore();
  });

  it("should handle Mercado Pago event", async () => {
    const body = {
      id: "mp_123",
      type: "payment",
    };

    const result = await controller.handleEvent(body);

    expect(MpEventAdapter.adapt).toHaveBeenCalledWith(body);

    expect(mockService.processEvent).toHaveBeenCalledWith({
      provider: "MERCADO_PAGO",
      eventType: "payment_succeeded",
      providerEventId: "mp-event-id",
    });

    expect(result).toEqual({ status: "received" });
  });

  it("should not call service when adapter returns null", async () => {
    adaptSpy.mockReturnValueOnce(null);

    const body = { type: "unknown_event" };

    const result = await controller.handleEvent(body);

    expect(MpEventAdapter.adapt).toHaveBeenCalledWith(body);
    expect(mockService.processEvent).not.toHaveBeenCalled();
    expect(result).toEqual({ status: "received" });
  });
});
