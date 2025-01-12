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
  static readonly defaultAuthType = AuthType.Bearer

  private readonly _authTypeMap: Record<AuthType, CanActivate> = {
    [AuthType.None]: { canActivate: () => true },
    [AuthType.Bearer]: this.accessTokenGuard,
    [AuthType.RefreshToken]: this.refreshTokenGuard
  }

  constructor(
    private readonly accessTokenGuard: AccessTokenGuard,
    private readonly refreshTokenGuard: RefreshTokenGuard,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypes = this.getAuthTypes(context)
    const guards = this.getGuardsFromAuthTypes(authTypes)

    return this.tryActivateGuards(guards, context)
  }

  private getAuthTypes(context: ExecutionContext): AuthType[] {
    return (
      this.reflector.getAllAndOverride<AuthType[]>(AUTH_TYPE_KEY, [
        context.getHandler(),
        context.getClass()
      ]) ?? [AuthenticationGuard.defaultAuthType]
    )
  }

  private getGuardsFromAuthTypes(authTypes: AuthType[]): CanActivate[] {
    return authTypes.map((type) => {
      const guard = this._authTypeMap[type]
      if (!guard) {
        throw new Error(`Unknown auth type: ${type}`)
      }
      return guard
    })
  }

  private async tryActivateGuards(
    guards: CanActivate[],
    context: ExecutionContext
  ): Promise<boolean> {
    let lastError: Error = new UnauthorizedException('Authentication failed')

    for (const guard of guards) {
      try {
        const canActivate = await Promise.resolve(guard.canActivate(context))
        if (canActivate) {
          return true
        }
      } catch (error) {
        lastError =
          error instanceof Error ? error : new UnauthorizedException(error)
      }
    }

    throw lastError
  }
}
