import { DynamicModule, Module } from '@nestjs/common';
// import { IMailingService } from './i-mailing.service';
import { MailingService } from './mailing.service';
import { MailingModuleOptions } from './options';
import { ConfigService } from '@nestjs/config';

@Module({})
export class MailingModule {
  static forRootAsync(
    fn: (service: ConfigService) => Promise<MailingModuleOptions>,
  ): DynamicModule {
    return {
      module: MailingModule,
      providers: [
        {
          provide: MailingService,
          inject: [ConfigService],
          useFactory: async (service) => new MailingService(await fn(service)),
        },
      ],
      exports: [MailingService],
    };
  }
}
