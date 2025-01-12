import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from '@nestjs/common'
import { Response } from 'express'
import { map } from 'rxjs'
import { CookieService } from '../services/cookie.service'
import { SignedTokenPair } from '../types/token.types'
import { REFRESH_COOKIE_TOKEN } from '../auth.constants'

@Injectable()
export class CookieSetterInterceptor implements NestInterceptor {
  constructor(private cookieService: CookieService) {}
  intercept(context: ExecutionContext, next: CallHandler) {
    const res = context.switchToHttp().getResponse<Response>()

    return next.handle().pipe(
      map((data: SignedTokenPair) => {
        this.cookieService.setCookie(
          res,
          REFRESH_COOKIE_TOKEN,
          data.refreshToken
        )
        delete data.refreshToken
        return data
      })
    )
  }
}
