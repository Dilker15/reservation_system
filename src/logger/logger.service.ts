
import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { logger } from './logger.config';

@Injectable()
export class AppLoggerService implements NestLoggerService {
  private context?: string;

  withContext(context: string): AppLoggerService {
    const child = Object.create(this);
    child.context = context;
    return child;
  }

  log(message: string) {
    logger.info(message, { context: this.context });
  }

  error(message: string, trace?: string) {
    logger.error(`${message}${trace ? ' - ' + trace : ''}`, { context: this.context });
  }

  warn(message: string) {
    logger.warn(message, { context: this.context });
  }

  debug(message: string) {
    logger.debug(message, { context: this.context });
  }

  verbose(message: string) {
    logger.verbose(message, { context: this.context });
  }
}
