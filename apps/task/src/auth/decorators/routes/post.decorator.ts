import { HttpStatus, applyDecorators, HttpCode, Post } from '@nestjs/common'
import { ApiBearerAuth } from '@nestjs/swagger'
import { Roles } from 'apps/task/src/users/enums/roles.enum'
import { Role } from '../role.decorator'

export function UserPost(
  path?: string,
  statusCode: HttpStatus = HttpStatus.CREATED
) {
  return applyDecorators(HttpCode(statusCode), ApiBearerAuth(), Post(path))
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
