import { Controller, Logger } from '@nestjs/common';
import {
  EventPattern,
  Ctx,
  RmqContext,
  Payload,
  MessagePattern,
} from '@nestjs/microservices';
import { TaskAuditLogService } from './task.audit-log.service';
import {
  TASK_CREATED_EVENT,
  TASK_DELETED_EVENT,
  TASK_UPDATED_EVENT,
  TaskCreatedEventPayload,
  TaskDeletedEventPayload,
  TaskUpdatedEventPayload,
} from '@app/contracts';
import {
  FETCH_TASK_EVENTS,
  FetchTaskEventPayload,
} from '@app/contracts/audit-log/tasks/fetch-tasks';

@Controller()
export class TaskAuditLogController {
  private logger = new Logger(TaskAuditLogController.name);

  constructor(private taskAuditLogService: TaskAuditLogService) {}

  @EventPattern(TASK_CREATED_EVENT)
  async processTaskCreated(
    @Ctx() ctx: RmqContext,
    @Payload() { userId, taskId }: TaskCreatedEventPayload,
  ) {
    this.logger.log('Received the event : ' + TASK_CREATED_EVENT.cmd);
    try {
      await this.taskAuditLogService.taskCreated(userId, taskId);
    } catch (e) {
      if (e instanceof Error) {
        this.logger.error(e.message);
      }
      this.logger.error(e);
    }
    const channel = ctx.getChannelRef();
    const msg = ctx.getMessage();
    channel.ack(msg);
  }

  @EventPattern(TASK_UPDATED_EVENT)
  async processTaskUpdated(
    @Ctx() ctx: RmqContext,
    @Payload() { userId, taskId, changedTo }: TaskUpdatedEventPayload,
  ) {
    this.logger.log('Received the event : ' + TASK_UPDATED_EVENT.cmd);
    try {
      await this.taskAuditLogService.taskUpdated(userId, taskId, changedTo);
    } catch (e) {
      if (e instanceof Error) {
        this.logger.error(e.message);
      }
      this.logger.error(e);
    }
    const channel = ctx.getChannelRef();
    const msg = ctx.getMessage();
    channel.ack(msg);
  }

  @EventPattern(TASK_DELETED_EVENT)
  async processTaskDeleted(
    @Ctx() ctx: RmqContext,
    @Payload() { userId, taskId }: TaskDeletedEventPayload,
  ) {
    this.logger.log('Received the event : ' + TASK_DELETED_EVENT.cmd);
    try {
      await this.taskAuditLogService.taskDeleted(userId, taskId);
    } catch (e) {
      if (e instanceof Error) {
        this.logger.error(e.message);
      }
      this.logger.error(e);
    }
    const channel = ctx.getChannelRef();
    const msg = ctx.getMessage();
    channel.ack(msg);
  }

  @MessagePattern(FETCH_TASK_EVENTS)
  async processFetchTaskEvents(
    @Ctx() ctx: RmqContext,
    @Payload() { taskId }: FetchTaskEventPayload,
  ) {
    return await this.taskAuditLogService.fetchEvents(taskId);
  }
}
