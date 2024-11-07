import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskEvent, TaskEventSchema } from './task/schemas/task-event.schema';
import { TaskAuditLogService } from './task/task.audit-log.service';
import { TaskAuditLogController } from './task/task.audit-log.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TaskEvent.name, schema: TaskEventSchema },
    ]),
  ],
  providers: [TaskAuditLogService],
  controllers: [TaskAuditLogController],
})
export class AuditLogModule {}
