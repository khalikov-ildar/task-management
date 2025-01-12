import { ForbiddenException } from '@nestjs/common'

export class TaskPermissionDeniedException extends ForbiddenException {
  constructor(userId: number) {
    super(`User ${userId} does not have permission to edit this task`)
  }
}
