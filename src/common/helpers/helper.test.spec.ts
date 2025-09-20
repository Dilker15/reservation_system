import { BcryptService } from './bcryp';
import { GeneratorCodeService } from './codeGenerator';

describe('GeneratorCodeService', () => {
  let codeService: GeneratorCodeService;

  beforeEach(() => {
    codeService = new GeneratorCodeService();
  });

  it('should return a 5-digit numeric code', () => {
    const code = codeService.generate();
    expect(code).toMatch(/^\d{5}$/);
  });
  
});

describe('BcryptService', () => {
  let bcryptService: BcryptService;

  beforeEach(() => {
    bcryptService = new BcryptService();
  });

  it('should hash a password', async () => {
    const password = 'Password123';
    const hash = await bcryptService.hashPassword(password);
    expect(hash.startsWith('$2b$')).toBe(true);
  });

  it('should verify correct hash with password', async () => {
    const password = 'Secure123';
    const hash = await bcryptService.hashPassword(password);
    const isValid = await bcryptService.verifyPassword(password, hash);
    expect(isValid).toBe(true);
  });

  it('should fail verification with incorrect password', async () => {
    const password = 'Secure123';
    const wrongPassword = 'Secure12e';
    const hash = await bcryptService.hashPassword(password);
    const isValid = await bcryptService.verifyPassword(wrongPassword, hash);
    expect(isValid).toBe(false);
  });
});
