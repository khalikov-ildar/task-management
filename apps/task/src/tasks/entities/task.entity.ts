import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'
import { Priority } from '../enums/task-priority.enum'
import { User } from '../../users/entities/user.entity'

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  title: string

  @Column()
  description: string

  @Column({ type: 'enum', enum: Priority })
  priority: Priority

  @Column()
  deadline: Date

  @Column({ type: 'boolean', default: false })
  completed: boolean

  @ManyToMany(() => User, (u) => u.assignedTasks, {
    cascade: ['insert', 'update'],
    onDelete: 'CASCADE'
  })
  assignees: User[]

  @ManyToMany(() => User, (u) => u.allowedToEditTasks, {
    nullable: true,
    onDelete: 'CASCADE'
  })
  editors?: User[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
