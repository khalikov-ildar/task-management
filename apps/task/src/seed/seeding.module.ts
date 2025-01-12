import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { SeedingService } from './seeding.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersModule } from '../users/users.module'
import { User } from '../users/entities/user.entity'
import { RefreshToken } from '../auth/entities/refresh-token'
import { ResetToken } from '../auth/entities/reset-token'
import { Task } from '../tasks/entities/task.entity'
import { IHashingService } from '../auth/services/hashing/i-hashing.service'
import { HashingService } from '../auth/services/hashing/hashing.service'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
    UsersModule,
    TypeOrmModule.forFeature([Task])
  ],
  providers: [
    SeedingService,
    { provide: IHashingService, useClass: HashingService }
  ]
})
export class SeedingModule {}
