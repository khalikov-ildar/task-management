import { HttpStatus, applyDecorators, HttpCode, Put } from '@nestjs/common'
import { ApiBearerAuth } from '@nestjs/swagger'
import { Roles } from 'apps/task/src/users/enums/roles.enum'
import { Role } from '../role.decorator'

export function UserPut(path?: string, statusCode: HttpStatus = HttpStatus.OK) {
  return applyDecorators(HttpCode(statusCode), ApiBearerAuth(), Put(path))
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
