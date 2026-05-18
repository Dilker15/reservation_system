import { TokenEncrytionService } from './token-encrytion.service';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';

describe('TokenEncrytionService', () => {
  let service: TokenEncrytionService;
  let configService: Partial<ConfigService>;

  const VALID_SECRET = 'a'.repeat(64);

  const createService = (secret?: string) => {
    configService = {
      get: jest.fn().mockReturnValue(secret),
    };

    return new TokenEncrytionService(configService as ConfigService);
  };

  describe('constructor', () => {
    it('should throw if TOKEN_SECRET_KEY is not defined', () => {
      expect(() => createService(undefined)).toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw if TOKEN_SECRET_KEY is not 32 bytes', () => {
      expect(() => createService('abc')).toThrow(
        InternalServerErrorException,
      );
    });

    it('should be created successfully with valid secret', () => {
      service = createService(VALID_SECRET);
      expect(service).toBeDefined();
    });
  });

  describe('encrypt / decrypt', () => {
    beforeEach(() => {
      service = createService(VALID_SECRET);
    });

    it('should encrypt and decrypt value correctly', () => {
      const value = 'my-super-secret-token';

      const encrypted = service.encrypt(value);
      const decrypted = service.decrypt(encrypted);

      expect(encrypted).not.toBe(value);
      expect(decrypted).toBe(value);
    });

    it('should generate different encrypted values for same input', () => {
      const value = 'same-value';

      const encrypted1 = service.encrypt(value);
      const encrypted2 = service.encrypt(value);

      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should throw if payload is invalid', () => {
      expect(() => service.decrypt('invalid-payload')).toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw if authTag is invalid', () => {
      const value = 'secure-value';
      const encrypted = service.encrypt(value);

      const [iv, tag, content] = encrypted.split(':');

      const corruptedPayload = `${iv}:deadbeef:${content}`;

      expect(() => service.decrypt(corruptedPayload)).toThrow(
        InternalServerErrorException,
      );
    });
  });
});
