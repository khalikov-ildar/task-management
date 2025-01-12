import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from './entities/user.entity'
import { Repository } from 'typeorm'
import { UUID } from 'crypto'
import { Roles } from './enums/roles.enum'
import { UserSeed } from '../seed/seeding.service'

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async existsByEmail(email: string): Promise<boolean> {
    return await this.userRepo.existsBy({ email })
  }

  async findOneBy<TKey extends keyof User, TValue extends User[TKey]>(
    options: Record<TKey, TValue>
  ) {
    return await this.userRepo.findOneBy(options)
  }

  async create(payload: {
    email: string
    password: string
    name: string
    emailToken: UUID
    role: Roles
  }): Promise<User> {
    const user = this.userRepo.create({
      email: payload.email,
      password: payload.password,
      name: payload.name,
      emailConfirmationToken: payload.emailToken,
      role: payload.role
    })
    return await this.userRepo.save(user)
  }

  async updateBy<TKey extends keyof User, TValue extends User[TKey]>(
    by: Record<TKey, TValue>,
    data: Partial<User>
  ) {
    await this.userRepo.update(by, data)
  }

  async deleteAll(): Promise<void> {
    await this.userRepo.delete({})
  }

  async __createForSeed(seed: UserSeed): Promise<User> {
    const user = this.userRepo.create(seed)
    return await this.userRepo.save(user)
  }
}
