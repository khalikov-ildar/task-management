import { CreateTaskDto } from 'apps/task/src/tasks/dtos/create-task.dto'
import { Priority } from '../../../task/src/tasks/enums/task-priority.enum'
import { Roles } from '../../../task/src/users/enums/roles.enum'
import { randomUUID } from 'crypto'

export const user = {
  email: 'email@email.com',
  password: 'password123',
  name: 'Nick',
  emailToken: randomUUID(),
  role: Roles.User
}

export const moderator = {
  email: 'moderator@email.com',
  password: 'password456',
  name: 'Nick',
  emailToken: randomUUID(),
  role: Roles.Moderator
}

const monthFromToday = new Date()
monthFromToday.setMonth(monthFromToday.getMonth() + 1)

export const validTask: CreateTaskDto = {
  title: 'Task title',
  description: 'Task description',
  priority: Priority.Low,
  deadline: monthFromToday,
  assignedUsers: [1]
}

export const invalidAllowance: CreateTaskDto = {
  title: 'Task title',
  description: 'Task description',
  priority: Priority.Low,
  deadline: monthFromToday,
  assignedUsers: [1],
  allowedToEditUsers: [2]
}

export const invalidDeadline: CreateTaskDto = {
  title: 'Task title',
  description: 'Task description',
  priority: Priority.Low,
  deadline: new Date(),
  assignedUsers: [1],
  allowedToEditUsers: [2]
}

export const invalidPriority = {
  title: 'Task title',
  description: 'Task description',
  priority: 'medium',
  deadline: monthFromToday,
  assignedUsers: [1]
}
