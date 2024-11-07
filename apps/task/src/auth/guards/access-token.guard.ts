import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AlsService } from '../../als/als.service';
import { JwtService } from '@nestjs/jwt';

import { AccessTokenType } from '../types/token.types';
import { Roles } from '../../users/enums/roles.enum';
import { Reflector } from '@nestjs/core';
import { ROLE_KEY } from '../decorators/role.decorator';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  private defaultRole = Roles.User;

  constructor(
    private als: AlsService,
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const token = this.getTheTokenFromAuthorization(req);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = (await this.jwtService.verify(token)) as AccessTokenType;
      this.als.setValue('userId', payload.sub).setValue('role', payload.role);
    } catch (e) {
      throw new UnauthorizedException('The token is invalid or expired');
    }

    const settedRole =
      this.reflector.getAllAndOverride<Roles>(ROLE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? this.defaultRole;

    if (settedRole > this.als.getValue('role')) {
      return false;
    }
    return true;
  }

  private getTheTokenFromAuthorization(req: Request): string | undefined {
    if (req.headers.authorization) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, token] = req.headers.authorization.split(' ');
      return token;
    }
    return undefined;
  }
}
