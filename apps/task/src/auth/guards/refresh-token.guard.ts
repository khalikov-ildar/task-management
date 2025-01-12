import { Request } from 'express'
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { AlsService } from '../../als/als.service'
import { JwtService } from '@nestjs/jwt'
import { RefreshTokenType } from '../types/token.types'
import { REFRESH_COOKIE_TOKEN } from '../auth.constants'

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private als: AlsService,
    private jwtService: JwtService
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>()
    const token = this.extractTokenFromCookie(req)
    if (!token) {
      throw new ForbiddenException()
    }
    try {
      const payload = (await this.jwtService.verifyAsync(
        token
      )) as RefreshTokenType

      if (!this.isValidPayload(payload)) {
        throw new UnauthorizedException('Invalid token payload')
      }

      this.als
        .setValue('userId', payload.sub)
        .setValue('jti', payload.jti)
        .setValue('role', payload.role)

      return true
    } catch (e) {
      if (e instanceof UnauthorizedException) {
        throw e
      }
      throw new UnauthorizedException('The token is invalid or expired')
    }
  }

  private isValidPayload(payload: RefreshTokenType): boolean {
    return Boolean(payload?.sub && payload?.jti && payload?.role)
  }

  private extractTokenFromCookie(req: Request): string | undefined {
    if (req.headers.cookie) {
      const [, token] = req.headers.cookie.split(`${REFRESH_COOKIE_TOKEN}=`)
      return token
    }
    return undefined
  }
}
