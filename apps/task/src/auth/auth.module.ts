import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersModule } from '../users/users.module'
import { RefreshToken } from './entities/refresh-token'
import { ResetToken } from './entities/reset-token'
import { AuthController } from './auth.controller'
import { IHashingService } from './services/hashing/i-hashing.service'
import { HashingService } from './services/hashing/hashing.service'
import { DateService } from '../shared/services/date.service'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { jwtConfiguration } from './config/jwt.config'
import { AccessTokenGuard } from './guards/access-token.guard'
import { AuthenticationGuard } from './guards/authentication.guard'
import { APP_GUARD } from '@nestjs/core'
import { RefreshTokenGuard } from './guards/refresh-token.guard'
import { AuthService } from './auth.service'
import { CookieService } from './services/cookie.service'
import { TokenService } from './services/token.service'
import { CookieSetterInterceptor } from './interceptors/cookie-setter.interceptor'

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([RefreshToken, ResetToken]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        return {
          secret: config.getOrThrow('JWT_SECRET')
        }
      }
    }),
    ConfigModule.forFeature(jwtConfiguration)
  ],
  providers: [
    { provide: IHashingService, useClass: HashingService },
    DateService,
    TokenService,
    AuthService,
    CookieService,
    CookieSetterInterceptor,
    AccessTokenGuard,
    RefreshTokenGuard,
    { provide: APP_GUARD, useClass: AuthenticationGuard }
  ],
  controllers: [AuthController]
})
export class AuthModule {}
