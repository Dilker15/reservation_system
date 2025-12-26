import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';


@Injectable()
export class TokenEncrytionService {

  private readonly algorithm = 'aes-256-gcm';
  private readonly ivLength = 16;
  private readonly key: Buffer;

  constructor(private readonly configService: ConfigService) {
    
    const secret = this.configService.get<string>('TOKEN_SECRET_KEY');
    if (!secret) {
      throw new InternalServerErrorException(
        'TOKEN_SECRET_KEY is not defined',
      );
    }

    this.key = Buffer.from(secret, 'hex');

    if (this.key.length !== 32) {
      throw new InternalServerErrorException(
        'TOKEN_SECRET_KEY must be 32 bytes (hex)',
      );
    }
  }

  encrypt(value: string): string {
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  
  decrypt(payload: string): string {
    try {
      const [ivHex, tagHex, content] = payload.split(':');

      const decipher = crypto.createDecipheriv(
        this.algorithm,
        this.key,
        Buffer.from(ivHex, 'hex'),
      );

      decipher.setAuthTag(Buffer.from(tagHex, 'hex'));

      let decrypted = decipher.update(content, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to decrypt token',
      );
    }
  }
}
