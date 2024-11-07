import { Global, Module } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { AlsService } from './als.service';

@Global()
@Module({
  providers: [
    {
      provide: AlsService,
      useFactory: () => {
        return new AlsService(new AsyncLocalStorage());
      },
    },
  ],
  exports: [AlsService],
})
export class AlsModule {}
