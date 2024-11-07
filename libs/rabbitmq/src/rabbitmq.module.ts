import { DynamicModule, Module } from '@nestjs/common';
import { RabbitmqService } from './rabbitmq.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { buildRmqConnectionString } from './rabbitmq-helper';

@Module({
  imports: [ConfigModule],
})
export class RabbitmqModule {
  static forRootAsync(envQueueKey: string): DynamicModule {
    return {
      module: RabbitmqModule,
      global: true,
      providers: [
        {
          provide: RabbitmqService,
          inject: [ConfigService],
          useFactory: async (config: ConfigService) => {
            const user = config.getOrThrow('RABBITMQ_DEFAULT_USER');
            const password = config.getOrThrow('RABBITMQ_DEFAULT_PASS');
            const host = config.getOrThrow('RABBITMQ_HOST');
            const queue = config.getOrThrow(envQueueKey);
            return new RabbitmqService(
              buildRmqConnectionString(user, password, host),
              queue,
            );
          },
        },
      ],
      exports: [RabbitmqService],
    };
  }
}
