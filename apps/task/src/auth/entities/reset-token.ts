import { User } from '../../users/entities/user.entity';
import { UUID } from 'crypto';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

@Entity('reset_tokens')
export class ResetToken {
  @PrimaryColumn('uuid')
  id: UUID;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  userId: number;

  @ManyToOne(() => User, (u) => u.resetToken, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
