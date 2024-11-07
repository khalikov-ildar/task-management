import { Body, Controller, HttpStatus, Param } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { AlsService } from '../als/als.service';
import {
  ProtectedDelete,
  ProtectedGet,
  ProtectedPost,
  ProtectedPut,
} from '../shared/swagger/route-decorators';
import { CreateTaskDto } from './dtos/create-task.dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { Role } from '../auth/decorators/role.decorator';
import { Roles } from '../users/enums/roles.enum';
import { UpdateTaskDto } from './dtos/update-task.dto';

@Controller('tasks')
export class TasksController {
  constructor(
    private tasksService: TasksService,
    private als: AlsService,
  ) {}

  @ProtectedGet('assigned')
  @ApiOkResponse()
  async getAllAssigned() {
    const userId = this.als.getValue('userId');
    return await this.tasksService.fetchAllAssigned(userId);
  }

  @Role(Roles.Moderator)
  @ProtectedPost()
  @ApiForbiddenResponse({
    description: 'Only user with moderator role can create tasks',
  })
  @ApiBadRequestResponse({
    description: 'Deadline should be at least on hour later than current time',
  })
  @ApiCreatedResponse()
  async create(@Body() createTaskDto: CreateTaskDto) {
    const userId = this.als.getValue('userId');
    return await this.tasksService.create(userId, createTaskDto);
  }

  @ProtectedPut(':id')
  @ApiNotFoundResponse()
  @ApiForbiddenResponse({
    description: 'User is not the editor or dont have the moderator role',
  })
  @ApiOkResponse()
  async update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    const userId = this.als.getValue('userId');
    const role = this.als.getValue('role');
    return await this.tasksService.update(+id, { userId, role }, updateTaskDto);
  }

  @Role(Roles.Moderator)
  @ProtectedDelete(':id', HttpStatus.NO_CONTENT)
  @ApiForbiddenResponse()
  @ApiNoContentResponse()
  async delete(@Param('id') id: string): Promise<void> {
    const userId = this.als.getValue('userId');
    return await this.tasksService.delete(+id, userId);
  }

  @Role(Roles.Moderator)
  @ProtectedGet(':id')
  fetchEvents(@Param('id') id: string) {
    return this.tasksService.fetchTaskEvents(+id);
  }
}
