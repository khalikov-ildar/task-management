import { RefreshToken } from '../../auth/entities/refresh-token'
import { ResetToken } from '../../auth/entities/reset-token'
import { UUID } from 'crypto'
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn
} from 'typeorm'
import { Roles } from '../enums/roles.enum'
import { Task } from '../../tasks/entities/task.entity'
import { Exclude } from 'class-transformer'

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column({ unique: true })
  email: string

  @Column()
  password: string

  @Column({ nullable: true })
  emailConfirmationToken: UUID | null

  @Column({ type: 'boolean', default: false })
  isEmailConfirmed: boolean

  @Column({ type: 'enum', enum: Roles, default: Roles.User })
  role: Roles

  @ManyToMany(() => Task, (t) => t.assignees)
  @JoinTable()
  assignedTasks: Task[]

  @ManyToMany(() => Task, (t) => t.editors, {
    cascade: ['insert', 'update'],
    onDelete: 'CASCADE'
  })
  @JoinTable()
  allowedToEditTasks: Task[]

  @OneToOne(() => ResetToken, (t) => t.user, { cascade: true })
  resetToken: ResetToken

  @OneToMany(() => RefreshToken, (t) => t.user, { cascade: true })
  refreshTokens: RefreshToken
}
