import { RabbitmqModule } from '@app/rabbitmq'
import {
  DynamicModule,
  MiddlewareConsumer,
  Module,
  NestModule
} from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersModule } from '../users/users.module'
import { AuthModule } from '../auth/auth.module'
import { AlsService } from '../als/als.service'
import { AlsModule } from '../als/als.module'
import { TasksModule } from '../tasks/tasks.module'
import { AppOptions } from './config/app.options'
import { RefreshToken } from '../auth/entities/refresh-token'
import { ResetToken } from '../auth/entities/reset-token'
import { Task } from '../tasks/entities/task.entity'
import { User } from '../users/entities/user.entity'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { throttlerConfig } from './config/throttler.config'
import { LoggerService } from './logger/logger.service'
import { APP_GUARD } from '@nestjs/core'

@Module({})
export class AppModule implements NestModule {
  constructor(private als: AlsService) {}
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply((req, res, next) => {
        const store = new Map()
        this.als.run(store, () => next())
      })
      .forRoutes('*')
  }

  static setEnvironment(env: AppOptions): DynamicModule {
    const envFilePath = env === 'prod' ? '.env' : '.env.test'

    return {
      module: AppModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath
        }),
        TypeOrmModule.forRootAsync({
          inject: [ConfigService],
          useFactory: async (config: ConfigService) => {
            return {
              type: 'postgres',
              url: config.getOrThrow('POSTGRES_URL'),
              entities: [User, RefreshToken, ResetToken, Task],
              synchronize: true
            }
          }
        }),
        RabbitmqModule.forRootAsync('RABBITMQ_WORKER'),
        ThrottlerModule.forRoot(throttlerConfig),
        AlsModule,
        UsersModule,
        AuthModule,
        TasksModule
      ],
      providers: [
        LoggerService,
        {
          provide: APP_GUARD,
          useClass: ThrottlerGuard
        }
      ]
    }
  }
}
