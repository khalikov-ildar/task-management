import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Task } from './entities/task.entity'
import { In, Repository } from 'typeorm'
import { CreateTaskDto } from './dtos/create-task.dto'
import { UpdateTaskDto } from './dtos/update-task.dto'
import { Roles } from '../users/enums/roles.enum'
import { RabbitmqService } from '@app/rabbitmq'
import {
  TASK_CREATED_EVENT,
  TASK_DELETED_EVENT,
  TASK_UPDATED_EVENT,
  TaskCreatedEventPayload,
  TaskDeletedEventPayload,
  TaskUpdatedEventPayload
} from '@app/contracts'
import {
  FETCH_TASK_EVENTS,
  FetchTaskEventPayload
} from '@app/contracts/audit-log/tasks/fetch-tasks'
import { User } from '../users/entities/user.entity'
import { IDateService } from '../shared/services/i-date.service'
import { TaskPermissionDeniedException } from './exceptions/task-permission-denied.exception'
import { TaskNotFoundException } from './exceptions/task-not-found.exception'

interface TaskUserInfo {
  userId: number
  role: Roles
}

@Injectable()
export class TasksService {
  private logger: Logger = new Logger(TasksService.name)

  constructor(
    private dateService: IDateService,
    private rmqService: RabbitmqService,
    @InjectRepository(Task) private tasksRepo: Repository<Task>,
    @InjectRepository(User) private usersRepo: Repository<User>
  ) {}

  async fetchAllAssigned(userId: number): Promise<Task[]> {
    return this.tasksRepo
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignees', 'assignee')
      .where('assignee.id = :userId', { userId })
      .getMany()
  }
  async fetchAllEditable(userId: number): Promise<Task[]> {
    return await this.tasksRepo
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.editors', 'editors')
      .where('editors.id = :userId', { userId })
      .getMany()
  }

  async create(userId: number, dto: CreateTaskDto): Promise<Task> {
    this.validateDeadline(dto.deadline, userId)
    await this.validateUsers(dto.assignedUsers)

    const allowedToEditUsers = dto.allowedToEditUsers || []

    this.checkAllowanceToEditList(allowedToEditUsers, dto.assignedUsers)

    const task = this.tasksRepo.create({
      ...dto,
      assignees: dto.assignedUsers.map((id) => ({ id })),
      editors: allowedToEditUsers.map((id) => ({ id }))
    })
    const createdTask = await this.tasksRepo.save(task)

    this.emitTaskCreated(createdTask, userId)

    return createdTask
  }

  async update(id: number, userInfo: TaskUserInfo, payload: UpdateTaskDto) {
    const task = await this.findTaskOrFail(id)

    this.validateEditPermission(task, userInfo)

    if (payload.deadline) {
      this.validateDeadline(payload.deadline, userInfo.userId)
    }

    if (payload.allowedToEditUsers) {
      this.checkAllowanceToEditList(
        payload.allowedToEditUsers,
        task.assignees.map((u) => u.id)
      )
    }

    const { assignedUsers, ...taskUpdates } = payload
    await this.tasksRepo.update({ id }, taskUpdates)

    if (assignedUsers) {
      const assignees = await this.usersRepo.findBy({ id: In(assignedUsers) })
      task.assignees = assignees
      await this.tasksRepo.save(task)
    }
    this.rmqService.emit(TASK_UPDATED_EVENT, {
      userId: userInfo.userId,
      taskId: id,
      changedTo: { ...task, ...taskUpdates }
    } satisfies TaskUpdatedEventPayload)

    return task
  }

  async delete(id: number, userId: number): Promise<void> {
    this.logger.log(`Deleting task with id: ${id}, by user with id: ${userId}`)
    if (!this.tasksRepo.existsBy({ id })) {
      this.logger.warn('Attempt to delete non-existing task with id: ' + id)
      return
    }
    await this.tasksRepo.delete({ id })
    this.rmqService.emit(TASK_DELETED_EVENT, {
      userId,
      taskId: id
    } satisfies TaskDeletedEventPayload)
    this.logger.log('Task deleted successfully with id: ' + id)
  }

  async fetchTaskEvents(taskId: number) {
    return this.rmqService.send(FETCH_TASK_EVENTS, {
      taskId
    } satisfies FetchTaskEventPayload)
  }

  async deleteAll(): Promise<void> {
    await this.tasksRepo.delete({})
  }

  private async findTaskOrFail(id: number): Promise<Task> {
    const task = await this.tasksRepo
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.editors', 'editors')
      .leftJoinAndSelect('task.assignees', 'assignees')
      .where('task.id = :id', { id })
      .getOne()

    if (!task) {
      throw new TaskNotFoundException(id)
    }

    return task
  }

  private validateDeadline(deadline: Date, userId: number): void {
    if (!this.dateService.isAfterOneHourFromNow(new Date(deadline))) {
      this.logger.warn(
        'Attempt to create task with deadline before current time by user with id: ' +
          userId
      )
      throw new BadRequestException(
        'Deadline must be at least one hour from current time'
      )
    }
  }

  private async validateUsers(userIds: number[]): Promise<void> {
    const users = await this.usersRepo.countBy({
      id: In(userIds)
    })

    if (users !== userIds.length) {
      throw new BadRequestException('One or more specified users do not exist')
    }
  }

  private validateEditPermission(task: Task, userInfo: TaskUserInfo): void {
    if (
      userInfo.role !== Roles.Moderator &&
      !task.editors.some((editor) => editor.id === userInfo.userId)
    ) {
      this.logger.warn(
        'Attempt to edit task without permission by user with id ' +
          userInfo.userId
      )
      throw new TaskPermissionDeniedException(userInfo.userId)
    }
  }

  private checkAllowanceToEditList(
    allowedToEditUsers: number[],
    assignedUsers: number[]
  ) {
    for (const userId of allowedToEditUsers) {
      if (!assignedUsers.includes(userId)) {
        throw new BadRequestException(
          'Allowed to edit user must be in list of assigned users'
        )
      }
    }
  }

  private emitTaskCreated(task: Task, userId: number): void {
    this.rmqService.emit(TASK_CREATED_EVENT, {
      taskId: task.id,
      userId
    } satisfies TaskCreatedEventPayload)
  }
}
