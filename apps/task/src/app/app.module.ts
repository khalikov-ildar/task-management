import { RabbitmqModule } from '@app/rabbitmq';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { AlsService } from '../als/als.service';
import { AlsStore } from '../als/als.store-type';
import { randomUUID } from 'crypto';
import { AlsModule } from '../als/als.module';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        return {
          type: 'postgres',
          url: config.getOrThrow('POSTGRES_URL'),
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),
    RabbitmqModule.forRootAsync('RABBITMQ_WORKER'),
    AlsModule,
    UsersModule,
    AuthModule,
    TasksModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  constructor(private als: AlsService) {}
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply((req, res, next) => {
        const store = new Map([['traceId', randomUUID()]]) satisfies AlsStore;

        this.als.run(store, () => next());
      })
      .forRoutes('*');
  }
}
