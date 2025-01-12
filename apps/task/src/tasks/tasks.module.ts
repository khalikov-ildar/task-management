import { Module } from '@nestjs/common'
import { TasksController } from './tasks.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Task } from './entities/task.entity'
import { TasksService } from './tasks.service'
import { DateService } from '../shared/services/date.service'
import { User } from '../users/entities/user.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Task]), TypeOrmModule.forFeature([User])],
  providers: [DateService, TasksService],
  controllers: [TasksController]
})
export class TasksModule {}
