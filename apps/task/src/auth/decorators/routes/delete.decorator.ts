import { HttpStatus, applyDecorators, HttpCode, Delete } from '@nestjs/common'
import { ApiBearerAuth } from '@nestjs/swagger'
import { Roles } from 'apps/task/src/users/enums/roles.enum'
import { Role } from '../role.decorator'

export function UserDelete(
  path?: string,
  statusCode: HttpStatus = HttpStatus.OK
) {
  return applyDecorators(HttpCode(statusCode), ApiBearerAuth(), Delete(path))
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
