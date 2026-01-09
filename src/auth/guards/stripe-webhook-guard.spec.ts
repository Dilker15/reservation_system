import { ConfigService } from "@nestjs/config";
import { StripeWebhookGuard } from "./stripe-webhook-guard";
import { Test, TestingModule } from "@nestjs/testing";
import { STRIPE_CLIENT } from "src/payment-mp/stripe.config";
import Stripe from "stripe";
import { BadRequestException, ExecutionContext, InternalServerErrorException } from "@nestjs/common";
import { Mock } from "node:test";


describe('src/auth/guards/stripe-webhook-guard.ts',()=>{

    let stripeGuard:StripeWebhookGuard;
    let mockConfServ:Partial<jest.Mocked<ConfigService>>;

    const mockStripe : Partial<jest.Mocked<Stripe>> = {
                webhooks: {
                    constructEvent: jest.fn().mockReturnValue({"id":'evt-1'})
                },
    } as any;

   const createContext = (request: any): ExecutionContext =>({
                            switchToHttp: () => ({
                            getRequest: () => request,
                         }),
                    } as ExecutionContext);

    beforeEach(async()=>{
        mockConfServ ={
            get:jest.fn().mockReturnValue('webhook-secret-key'),
        }
        const refService:TestingModule = await Test.createTestingModule({
            providers:[
                {
                    provide:ConfigService,
                    useValue:mockConfServ,
                },
                {
                    provide:STRIPE_CLIENT,
                    useValue:mockStripe,
                },
                StripeWebhookGuard,
            ]
        }).compile();

        stripeGuard = refService.get<StripeWebhookGuard>(StripeWebhookGuard);
    });

    afterEach(()=>{
        jest.clearAllMocks();
    })


    it("should throw BadRequestException signature not found in headers",()=>{
        const context = createContext({
            body:"mock-body",
            rawBody:"mock-rawBody",
            headers:{}
        })
        expect(()=>stripeGuard.canActivate(context)).toThrow(BadRequestException);
    });

    it("'should throw BadRequestException when webhook secret is not configured",()=>{
        mockConfServ.get?.mockReturnValueOnce('');
        const context = createContext({
            body:"mock-body",
            rawBody:"mock-rawBody",
            headers:{
                'stripe-signature':'mock-signature'
            }
        })
        expect(()=>stripeGuard.canActivate(context)).toThrow(BadRequestException);
    });
    
    
    it("should throw error constructEvent",()=>{
        const context = createContext({
            body:"mock-body",
            rawBody:"mock-rawBody",
            headers:{
                'stripe-signature':'mock-signature'
            }
        });
         (mockStripe.webhooks?.constructEvent as jest.Mock).mockImplementationOnce(()=>{throw new InternalServerErrorException('invalid signature')});
         expect(()=>stripeGuard.canActivate(context)).toThrow(BadRequestException);
         expect(mockStripe.webhooks?.constructEvent).toHaveBeenCalled()
    });


    it("should validate signtaure correctly",()=>{
        const context = createContext({
            body:"mock-body",
            rawBody:"mock-rawBody",
            headers:{
                'stripe-signature':'mock-signature'
            }
        });
        const result = stripeGuard.canActivate(context);
        expect(result).toBe(true);
    });


});

    



