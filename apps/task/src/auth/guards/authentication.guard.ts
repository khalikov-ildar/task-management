import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { AuthType } from '../enums/auth-type.enum'
import { AccessTokenGuard } from './access-token.guard'
import { RefreshTokenGuard } from './refresh-token.guard'
import { Reflector } from '@nestjs/core'
import { AUTH_TYPE_KEY } from '../decorators/auth.decorator'

@Injectable()
export class AuthenticationGuard implements CanActivate {
  static defaultAuthType = AuthType.Bearer
  private _authTypeMap: Record<AuthType, CanActivate> = {
    [AuthType.None]: { canActivate: () => true },
    [AuthType.Bearer]: this.accessTokenGuard,
    [AuthType.RefreshToken]: this.refreshTokenGuard
  }

  constructor(
    private accessTokenGuard: AccessTokenGuard,
    private refreshTokenGuard: RefreshTokenGuard,
    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypes = this.reflector.getAllAndOverride<AuthType[]>(
      AUTH_TYPE_KEY,
      [context.getHandler(), context.getClass()]
    ) ?? [AuthenticationGuard.defaultAuthType]
    const guards = authTypes.flatMap((guard) => this._authTypeMap[guard])

    let error = new UnauthorizedException()

    for (const instance of guards) {
      const canActivate = await Promise.resolve(
        instance.canActivate(context)
      ).catch((e) => {
        error = e
      })
      if (canActivate) {
        return true
      }
    }
    throw error
  }
}
