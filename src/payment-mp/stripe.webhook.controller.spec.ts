import { Test, TestingModule } from "@nestjs/testing";
import { WebHookService } from "./services/webhook.service";
import { StripeWebHookController } from "./stripe.webhook.controller";
import Stripe from "stripe";
import { StripeEventAdapter } from "./adapters/stripe.event.adapter";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";

describe("StripeWebHookController", () => {
  let controller: StripeWebHookController;
  let mockService: Partial<jest.Mocked<WebHookService>>;
  let adaptSpy: jest.SpyInstance;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockService = {
      processEvent: jest.fn(),
    };

    adaptSpy = jest
      .spyOn(StripeEventAdapter, "adapt")
      .mockReturnValue({
        id: "event-id",
        type: "payment",
      } as any);

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [StripeWebHookController],
      providers: [
        {
          provide: WebHookService,
          useValue: mockService,
        },
        {
          provide: "STRIPE_CLIENT",
          useValue: {},
        },
        {
          provide: ConfigService,
          useValue: {},
        },
      ],
    }).compile();

    controller = moduleRef.get<StripeWebHookController>(StripeWebHookController);
  });

  afterEach(() => {
    adaptSpy.mockRestore();
  });

  it("should handle event", async () => {
    const mockReq: Partial<Request> & { stripeEvent: Stripe.Event } = {
      body: { some: "data" },
      headers: { "content-type": "application/json" },
      stripeEvent: {
        id: "evt_test_123",
        type: "payment_intent.succeeded",
        data: { object: {} },
      } as Stripe.Event,
    };

    const result = await controller.handleEvent(mockReq as any);

    expect(StripeEventAdapter.adapt).toHaveBeenCalledWith(
      mockReq.stripeEvent
    );

    expect(mockService.processEvent).toHaveBeenCalledWith({
      id: "event-id",
      type: "payment",
    });

    expect(result).toEqual({ received: true });
  });
});
