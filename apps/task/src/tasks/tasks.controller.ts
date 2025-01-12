import { Body, Controller, HttpStatus, Param } from '@nestjs/common'
import { TasksService } from './tasks.service'
import { AlsService } from '../als/als.service'
import {
  ModeratorDelete,
  ModeratorGet,
  ModeratorPost,
  UserDelete,
  UserGet,
  UserPost,
  UserPut
} from '../shared/swagger/route-decorators'
import { CreateTaskDto } from './dtos/create-task.dto'
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse
} from '@nestjs/swagger'
import { UpdateTaskDto } from './dtos/update-task.dto'

@Controller('tasks')
export class TasksController {
  constructor(
    private tasksService: TasksService,
    private als: AlsService
  ) {}

  @UserGet('assigned')
  @ApiOkResponse()
  async getAllAssigned() {
    const userId = this.als.getValue('userId')
    return await this.tasksService.fetchAllAssigned(userId)
  }

  @ModeratorPost()
  @ApiForbiddenResponse({
    description: 'Only user with moderator role can create tasks'
  })
  @ApiBadRequestResponse({
    description: 'Deadline should be at least on hour later than current time'
  })
  @ApiCreatedResponse()
  async create(@Body() createTaskDto: CreateTaskDto) {
    const userId = this.als.getValue('userId')
    return await this.tasksService.create(userId, createTaskDto)
  }

  @UserPut(':id')
  @ApiNotFoundResponse()
  @ApiForbiddenResponse({
    description: 'User is not the editor or dont have the moderator role'
  })
  @ApiOkResponse()
  async update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    const userId = this.als.getValue('userId')
    const role = this.als.getValue('role')
    return await this.tasksService.update(+id, { userId, role }, updateTaskDto)
  }

  @ModeratorDelete(':id', HttpStatus.NO_CONTENT)
  @ApiForbiddenResponse()
  @ApiNoContentResponse()
  async delete(@Param('id') id: string): Promise<void> {
    const userId = this.als.getValue('userId')
    return await this.tasksService.delete(+id, userId)
  }

  @ModeratorGet(':id')
  fetchEvents(@Param('id') id: string) {
    return this.tasksService.fetchTaskEvents(+id)
  }
}
