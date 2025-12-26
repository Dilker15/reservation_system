import { Test, TestingModule } from '@nestjs/testing';
import { TokenEncrytionService } from './token-encrytion.service';

describe('TokenEncrytionService', () => {
  let service: TokenEncrytionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TokenEncrytionService],
    }).compile();

    service = module.get<TokenEncrytionService>(TokenEncrytionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
