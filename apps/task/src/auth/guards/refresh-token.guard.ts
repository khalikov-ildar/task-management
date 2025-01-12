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
    const token = this.getTheTokenFromCookie(req)
    if (!token) {
      throw new ForbiddenException()
    }
    try {
      const payload = (await this.jwtService.verify(token)) as RefreshTokenType
      this.als
        .setValue('userId', payload.sub)
        .setValue('jti', payload.jti)
        .setValue('role', payload.role)
    } catch (e) {
      throw new UnauthorizedException('The token is invalid or expired')
    }
    return true
  }

  private getTheTokenFromCookie(req: Request): string | undefined {
    if (req.headers.cookie) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, token] = req.headers.cookie.split(`${REFRESH_COOKIE_TOKEN}=`)
      return token
    }
    return undefined
  }
}
