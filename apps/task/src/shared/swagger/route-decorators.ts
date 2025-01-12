import {
  applyDecorators,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Put
} from '@nestjs/common'
import { ApiBearerAuth } from '@nestjs/swagger'
import { Role } from '../../auth/decorators/role.decorator'
import { Roles } from '../../users/enums/roles.enum'

export function UserGet(path?: string, statusCode: HttpStatus = HttpStatus.OK) {
  return applyDecorators(HttpCode(statusCode), ApiBearerAuth(), Get(path))
}

export function UserPost(
  path?: string,
  statusCode: HttpStatus = HttpStatus.CREATED
) {
  return applyDecorators(HttpCode(statusCode), ApiBearerAuth(), Post(path))
}

export function UserPatch(
  path?: string,
  statusCode: HttpStatus = HttpStatus.OK
) {
  return applyDecorators(HttpCode(statusCode), ApiBearerAuth(), Patch(path))
}

export function UserPut(path?: string, statusCode: HttpStatus = HttpStatus.OK) {
  return applyDecorators(HttpCode(statusCode), ApiBearerAuth(), Put(path))
}

export function UserDelete(
  path?: string,
  statusCode: HttpStatus = HttpStatus.OK
) {
  return applyDecorators(HttpCode(statusCode), ApiBearerAuth(), Delete(path))
}

export function ModeratorGet(
  path?: string,
  statusCode: HttpStatus = HttpStatus.OK
) {
  return applyDecorators(
    HttpCode(statusCode),
    Role(Roles.Moderator),
    ApiBearerAuth(),
    Get(path)
  )
}

export function ModeratorPost(
  path?: string,
  statusCode: HttpStatus = HttpStatus.CREATED
) {
  return applyDecorators(
    HttpCode(statusCode),
    Role(Roles.Moderator),
    ApiBearerAuth(),
    Post(path)
  )
}

export function ModeratorPatch(
  path?: string,
  statusCode: HttpStatus = HttpStatus.OK
) {
  return applyDecorators(
    HttpCode(statusCode),
    Role(Roles.Moderator),
    ApiBearerAuth(),
    Patch(path)
  )
}

export function ModeratorPut(
  path?: string,
  statusCode: HttpStatus = HttpStatus.OK
) {
  return applyDecorators(
    HttpCode(statusCode),
    Role(Roles.Moderator),
    ApiBearerAuth(),
    Put(path)
  )
}

export function ModeratorDelete(
  path?: string,
  statusCode: HttpStatus = HttpStatus.OK
) {
  return applyDecorators(
    HttpCode(statusCode),
    Role(Roles.Moderator),
    ApiBearerAuth(),
    Delete(path)
  )
}
