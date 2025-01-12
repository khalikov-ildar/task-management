import { Injectable } from '@nestjs/common'
import { UsersService } from '../users/users.service'
import { faker } from '@faker-js/faker'
import { Roles } from '../users/enums/roles.enum'
import { IHashingService } from '../auth/services/hashing/i-hashing.service'
import { InjectRepository } from '@nestjs/typeorm'
import { Task } from '../tasks/entities/task.entity'
import { Repository } from 'typeorm'
import { Priority } from '../tasks/enums/task-priority.enum'

export type UserSeed = {
  email: string
  password: string
  name: string
  role: Roles
  isEmailConfirmed: true
}

export type TaskSeed = {
  title: string
  description: string
  deadline: Date
  priority: Priority
  completed: boolean
  assignees: number[]
  editors?: number[]
}

export type ApplicationSeedOptions = {
  userSeedOptions?: { userQuantity?: number; moderatorQuantity?: number }
  taskSeedOptions?: {
    guaranteedUncompletedTasks?: number
    randomTasks?: number
  }
}

@Injectable()
export class SeedingService {
  constructor(
    private usersService: UsersService,
    private hashingService: IHashingService,
    @InjectRepository(Task) private taskRepo: Repository<Task>
  ) {}

  async generateUserSeed(): Promise<UserSeed> {
    return {
      email: faker.internet.email(),
      password: await this.hashingService.hash(faker.internet.password()),
      name: faker.internet.displayName(),
      role: Roles.User,
      isEmailConfirmed: true
    }
  }

  async generateModeratorSeed(postfix: number): Promise<UserSeed> {
    return {
      email: `admin${postfix}@email.com`,
      password: await this.hashingService.hash(`password${postfix}`),
      name: faker.internet.displayName(),
      role: Roles.Moderator,
      isEmailConfirmed: true
    }
  }

  async seedUsers(
    usersQuantity: number,
    moderatorQuantity: number
  ): Promise<void> {
    for (let i = 0; i < usersQuantity; i++) {
      await this.usersService.__createForSeed(await this.generateUserSeed())
    }

    for (let i = 0; i < moderatorQuantity; i++) {
      await this.usersService.__createForSeed(
        await this.generateModeratorSeed(i + 1)
      )
    }
  }

  generateTaskSeed(
    assignees: number[],
    editors?: number[],
    completed?: boolean
  ): TaskSeed {
    return {
      title: faker.lorem.words({ min: 2, max: 7 }),
      description: faker.lorem.sentences({ min: 4, max: 15 }),
      deadline: faker.date.future(),
      priority: faker.helpers.arrayElement([
        Priority.Low,
        Priority.Average,
        Priority.High
      ]),
      completed,
      assignees,
      editors
    }
  }

  generateRandomAssignees(quantity: number, maxAssigneeId: number): number[] {
    const assignees: number[] = []

    while (assignees.length < quantity) {
      let randomId = faker.number.int({ min: 1, max: maxAssigneeId })
      while (assignees.includes(randomId)) {
        randomId = faker.number.int({ min: 1, max: maxAssigneeId })
      }
      assignees.push(randomId)
    }
    return assignees
  }

  generateRandomEditors(assignees: number[]): number[] {
    const editors = []

    const numberOfEditors = faker.number.int({ min: 1, max: 2 })
    while (editors.length < numberOfEditors) {
      let randomId = faker.helpers.arrayElement(assignees)
      while (editors.includes(randomId)) {
        randomId = faker.helpers.arrayElement(assignees)
      }
      editors.push(randomId)
    }
    return editors
  }

  generateTask(
    maxAssigneeId: number,
    options: { completeRandomness: boolean; completed?: boolean }
  ): Task {
    const assignees = this.generateRandomAssignees(
      faker.number.int({ min: 1, max: 5 }),
      maxAssigneeId
    )
    const editors = faker.helpers.maybe(() =>
      this.generateRandomEditors(assignees)
    )
    const taskSeed = this.generateTaskSeed(
      assignees,
      editors,
      options.completeRandomness ? faker.datatype.boolean() : options.completed
    )
    return this.taskRepo.create({
      ...taskSeed,
      assignees: assignees.map((id) => ({ id })),
      editors: editors?.map((id) => ({ id }))
    })
  }

  async seedTasks(
    guaranteedUncompletedTasks: number,
    randomTasks: number,
    maxAssigneeId: number
  ): Promise<void> {
    for (let i = 0; i < randomTasks; i++) {
      const task = this.generateTask(maxAssigneeId, {
        completeRandomness: true
      })
      await this.taskRepo.save(task)
    }

    for (let i = 0; i < guaranteedUncompletedTasks; i++) {
      const task = this.generateTask(maxAssigneeId, {
        completeRandomness: false,
        completed: true
      })
      await this.taskRepo.save(task)
    }
  }

  async seedApplication(
    options: ApplicationSeedOptions = {
      userSeedOptions: {
        userQuantity: 15,
        moderatorQuantity: 5
      },
      taskSeedOptions: {
        guaranteedUncompletedTasks: 4,
        randomTasks: 10
      }
    }
  ): Promise<void> {
    await this.seedUsers(
      options.userSeedOptions.userQuantity,
      options.userSeedOptions.moderatorQuantity
    )
    await this.seedTasks(
      options.taskSeedOptions.guaranteedUncompletedTasks,
      options.taskSeedOptions.randomTasks,
      options.userSeedOptions.userQuantity
    )
  }
}
