import { HttpStatus, applyDecorators, HttpCode, Patch } from '@nestjs/common'
import { ApiBearerAuth } from '@nestjs/swagger'
import { Roles } from 'apps/task/src/users/enums/roles.enum'
import { Role } from '../role.decorator'

export function UserPatch(
  path?: string,
  statusCode: HttpStatus = HttpStatus.OK
) {
  return applyDecorators(HttpCode(statusCode), ApiBearerAuth(), Patch(path))
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
