import { BadRequestException } from "@nestjs/common";
import { OAuthFactory } from "./StrategyOAuthFactory";
import { MercadoPagoOAuthStrategy } from "./Mp0AuthStrategy";
import { StripeOAuthStrategy } from "./Stripe0AuthStrategy";
import { PROVIDERS } from "src/common/Interfaces";



describe('OAuthFactory', () => {
    
  let oauthFactory: OAuthFactory;
  let mpStrategy: MercadoPagoOAuthStrategy;
  let stripeStrategy: StripeOAuthStrategy;

  beforeEach(() => {
   
    mpStrategy = {} as MercadoPagoOAuthStrategy;
    stripeStrategy = {} as StripeOAuthStrategy;

    oauthFactory = new OAuthFactory(mpStrategy, stripeStrategy);
  });

  describe('getStrategy', () => {

    it('should return MercadoPago strategy when provider is MP', () => {
      const strategy = oauthFactory.getStrategy(PROVIDERS.MP);
      expect(strategy).toBe(mpStrategy);
    });




    it('should return Stripe strategy when provider is STRIPE', () => {
      const strategy = oauthFactory.getStrategy(PROVIDERS.STRIPE);
      expect(strategy).toBe(stripeStrategy);
    });



    it('should throw BadRequestException for an invalid provider', () => {
      const invalidProvider = 'INVALID';
      expect(() => oauthFactory.getStrategy(invalidProvider))
        .toThrow(BadRequestException);
      expect(() => oauthFactory.getStrategy(invalidProvider))
        .toThrow(`Providers permMited : ${PROVIDERS.MP} , ${PROVIDERS.STRIPE}`);
    });

  });

});
