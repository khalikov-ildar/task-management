import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TaskEvent } from './schemas/task-event.schema';
import { Model } from 'mongoose';

@Injectable()
export class TaskAuditLogService {
  constructor(
    @InjectModel(TaskEvent.name) private taskEventModel: Model<TaskEvent>,
  ) {}

  async taskCreated(userId: number, taskId: number) {
    const model = new this.taskEventModel({
      userId,
      taskId,
      kind: 'created',
      date: new Date(),
    });
    await model.save();
  }

  async taskUpdated(userId: number, taskId: number, changes: any) {
    const madeChanges = JSON.stringify(changes);
    const model = new this.taskEventModel({
      userId,
      taskId,
      madeChanges,
      kind: 'updated',
      date: new Date(),
    });
    model.save();
  }

  async taskDeleted(userId: number, taskId: number) {
    const model = new this.taskEventModel({
      userId,
      taskId,
      kind: 'deleted',
      date: new Date(),
    });
    model.save();
  }

  async fetchEvents(taskId: number) {
    return await this.taskEventModel.find({ taskId });
  }
}
