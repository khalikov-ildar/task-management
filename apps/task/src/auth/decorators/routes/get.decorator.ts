import { HttpStatus, applyDecorators, HttpCode, Get } from '@nestjs/common'
import { ApiBearerAuth } from '@nestjs/swagger'
import { Roles } from 'apps/task/src/users/enums/roles.enum'
import { Role } from '../role.decorator'

export function UserGet(path?: string, statusCode: HttpStatus = HttpStatus.OK) {
  return applyDecorators(HttpCode(statusCode), ApiBearerAuth(), Get(path))
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
