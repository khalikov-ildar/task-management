import {
  applyDecorators,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { Auth } from '../../auth/decorators/auth.decorator';
import { AuthType } from '../../auth/guards/auth-type.enum';
import { ApiBearerAuth } from '@nestjs/swagger';

export function ProtectedGet(
  path?: string,
  statusCode: HttpStatus = HttpStatus.OK,
) {
  return applyDecorators(
    Auth(AuthType.Bearer),
    HttpCode(statusCode),
    ApiBearerAuth(),
    Get(path),
  );
}

export function ProtectedPost(
  path?: string,
  statusCode: HttpStatus = HttpStatus.CREATED,
) {
  return applyDecorators(
    Auth(AuthType.Bearer),
    HttpCode(statusCode),
    ApiBearerAuth(),
    Post(path),
  );
}

export function ProtectedPatch(
  path?: string,
  statusCode: HttpStatus = HttpStatus.OK,
) {
  return applyDecorators(
    Auth(AuthType.Bearer),
    HttpCode(statusCode),
    ApiBearerAuth(),
    Patch(path),
  );
}

export function ProtectedPut(
  path?: string,
  statusCode: HttpStatus = HttpStatus.OK,
) {
  return applyDecorators(
    Auth(AuthType.Bearer),
    HttpCode(statusCode),
    ApiBearerAuth(),
    Put(path),
  );
}

export function ProtectedDelete(
  path?: string,
  statusCode: HttpStatus = HttpStatus.OK,
) {
  return applyDecorators(
    Auth(AuthType.Bearer),
    HttpCode(statusCode),
    ApiBearerAuth(),
    Delete(path),
  );
}
