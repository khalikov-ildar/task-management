import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Task } from './entities/task.entity'
import { Repository } from 'typeorm'
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
import { DateService } from '../shared/services/date.service'
import {
  FETCH_TASK_EVENTS,
  FetchTaskEventPayload
} from '@app/contracts/audit-log/tasks/fetch-tasks'
import { User } from '../users/entities/user.entity'

@Injectable()
export class TasksService {
  constructor(
    private dateService: DateService,
    private rmqService: RabbitmqService,
    @InjectRepository(Task) private tasksRepo: Repository<Task>,
    @InjectRepository(User) private usersRepo: Repository<User>
  ) {}

  async fetchAllAssigned(userId: number): Promise<Task[]> {
    return await this.tasksRepo.find({
      where: { assignees: { id: userId } }
    })
  }

  async fetchAllEditable(userId: number): Promise<Task[]> {
    return await this.tasksRepo.find({
      where: { editors: { id: userId } }
    })
  }

  async create(
    userId: number,
    {
      title,
      description,
      priority,
      deadline,
      assignedUsers,
      allowedToEditUsers
    }: CreateTaskDto
  ): Promise<Task> {
    if (!this.dateService.isAfterOneHourFromNow(new Date(deadline))) {
      throw new BadRequestException(
        'The provided deadline should be at least one hour current time'
      )
    }

    if (!allowedToEditUsers) {
      allowedToEditUsers = []
    }

    this.checkAllowanceToEditList(allowedToEditUsers, assignedUsers)

    const task = this.tasksRepo.create({
      title,
      description,
      priority,
      deadline,
      assignees: assignedUsers.map((id) => ({ id })),
      editors: allowedToEditUsers
        ? allowedToEditUsers.map((id) => ({ id }))
        : undefined
    })
    const createdTask = await this.tasksRepo.save(task)

    this.rmqService.emit(TASK_CREATED_EVENT, {
      taskId: createdTask.id,
      userId
    } satisfies TaskCreatedEventPayload)

    return createdTask
  }

  async update(
    id: number,
    userInfo: { userId: number; role: Roles },
    payload: UpdateTaskDto
  ) {
    const task = await this.tasksRepo
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.editors', 'editors')
      .leftJoinAndSelect('task.assignees', 'assignees')
      .where('task.id = :id', { id })
      .getOne()

    if (!task) {
      throw new NotFoundException()
    }

    this.throwIfCannotEdit(task, userInfo.userId, userInfo.role)

    if (payload.allowedToEditUsers) {
      this.checkAllowanceToEditList(
        payload.allowedToEditUsers,
        task.assignees.map((u) => u.id)
      )
    }

    console.log(task)
    const { assignedUsers, ...taskUpdates } = payload
    await this.tasksRepo.update({ id }, taskUpdates)

    // Update the many-to-many relationship for assignees
    if (assignedUsers) {
      const assignees = await this.usersRepo.findByIds(assignedUsers) // Use appropriate method to fetch users
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
    if (!this.tasksRepo.existsBy({ id })) {
      return
    }
    await this.tasksRepo.delete({ id })
    this.rmqService.emit(TASK_DELETED_EVENT, {
      userId,
      taskId: id
    } satisfies TaskDeletedEventPayload)
  }

  async fetchTaskEvents(taskId: number) {
    return this.rmqService.send(FETCH_TASK_EVENTS, {
      taskId
    } satisfies FetchTaskEventPayload)
  }

  async deleteAll(): Promise<void> {
    await this.tasksRepo.delete({})
  }

  private throwIfCannotEdit(task: Task, userId: number, role: Roles): void {
    if (role === Roles.Moderator) {
      return
    }
    if (task?.editors && !task.editors.some((u) => u.id === userId)) {
      console.log(`Role ${role}, task editors ${task?.editors}`)
      throw new ForbiddenException('  You are not allowed to change this task')
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
}
