import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common'
import pino from 'pino'

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: pino.Logger

  constructor() {
    this.logger = pino({
      transport: {
        targets: [
          {
            target: 'pino-pretty',
            level: 'info',
            options: {
              colorize: true,
              translateTime: 'UTC:yyyy-mm-dd HH:MM:ss',
              ignore: 'pid,hostname'
            }
          },
          {
            target: 'pino/file',
            level: 'error',
            options: {
              destination: 'logs/error.log',
              mkdir: true
            }
          },
          {
            target: 'pino/file',
            level: 'info',
            options: {
              destination: 'logs/combined.log',
              mkdir: true
            }
          }
        ]
      },
      redact: {
        paths: ['email', 'password'],
        remove: true
      }
    })
  }

  log(message: string, context?: string) {
    this.logger.info({ context }, message)
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error({ context, trace }, message)
  }

  warn(message: string, context?: string) {
    this.logger.warn({ context }, message)
  }

  debug(message: string, context?: string) {
    this.logger.debug({ context }, message)
  }

  verbose(message: string, context?: string) {
    this.logger.trace({ context }, message)
  }
}
