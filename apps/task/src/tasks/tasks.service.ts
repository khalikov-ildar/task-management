import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dtos/create-task.dto';
import { UpdateTaskDto } from './dtos/update-task.dto';
import { Roles } from '../users/enums/roles.enum';
import { RabbitmqService } from '@app/rabbitmq';
import {
  TASK_CREATED_EVENT,
  TASK_DELETED_EVENT,
  TASK_UPDATED_EVENT,
  TaskCreatedEventPayload,
  TaskDeletedEventPayload,
  TaskUpdatedEventPayload,
} from '@app/contracts';
import { DateService } from '../shared/services/date.service';
import {
  FETCH_TASK_EVENTS,
  FetchTaskEventPayload,
} from '@app/contracts/audit-log/tasks/fetch-tasks';

@Injectable()
export class TasksService {
  constructor(
    private dateService: DateService,
    private rmqService: RabbitmqService,
    @InjectRepository(Task) private tasksRepo: Repository<Task>,
  ) {}

  async fetchAllAssigned(userId: number): Promise<Task[]> {
    return await this.tasksRepo.find({
      where: { assignees: { id: userId } },
    });
  }

  async fetchAllEditable(userId: number): Promise<Task[]> {
    return await this.tasksRepo.find({
      where: { editors: { id: userId } },
    });
  }

  async create(
    userId: number,
    {
      title,
      description,
      priority,
      deadline,
      assignedUsers,
      allowedToEditUsers,
    }: CreateTaskDto,
  ): Promise<Task> {
    if (!this.dateService.isAfterOneHourFromNow(new Date(deadline))) {
      throw new BadRequestException(
        'The provided deadline should be at least one hour current time',
      );
    }

    const task = this.tasksRepo.create({
      title,
      description,
      priority,
      deadline,
      assignees: assignedUsers.map((id) => ({ id })),
      editors: allowedToEditUsers
        ? allowedToEditUsers.map((id) => ({ id }))
        : undefined,
    });
    const createdTask = await this.tasksRepo.save(task);

    this.rmqService.emit(TASK_CREATED_EVENT, {
      taskId: createdTask.id,
      userId,
    } satisfies TaskCreatedEventPayload);

    return createdTask;
  }

  async update(
    id: number,
    userInfo: { userId: number; role: Roles },
    payload: UpdateTaskDto,
  ) {
    const task = await this.tasksRepo.findOneBy({ id });
    if (!task) {
      throw new NotFoundException();
    }

    this.throwIfCannotEdit(task, userInfo.userId, userInfo.role);

    const updatedResult = await this.tasksRepo.update({ id }, payload);
    this.rmqService.emit(TASK_UPDATED_EVENT, {
      userId: userInfo.userId,
      taskId: id,
      changedTo: updatedResult,
    } satisfies TaskUpdatedEventPayload);

    return updatedResult;
  }

  async delete(id: number, userId: number): Promise<void> {
    if (!this.tasksRepo.existsBy({ id })) {
      return;
    }
    await this.tasksRepo.delete({ id });
    this.rmqService.emit(TASK_DELETED_EVENT, {
      userId,
      taskId: id,
    } satisfies TaskDeletedEventPayload);
  }

  async fetchTaskEvents(taskId: number) {
    return this.rmqService.send(FETCH_TASK_EVENTS, {
      taskId,
    } satisfies FetchTaskEventPayload);
  }

  private throwIfCannotEdit(task: Task, userId: number, role: Roles): void {
    if (
      !task.editors.some((u) => u.id === userId) ||
      role !== Roles.Moderator
    ) {
      throw new ForbiddenException('You are not allowed to change this task');
    }
  }
}
