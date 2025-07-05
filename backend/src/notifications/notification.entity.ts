import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Comment } from '../comments/comment.entity';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
  recipient: User;

  @ManyToOne(() => Comment, { nullable: false, eager: true })
  comment: Comment; // the reply that triggered this

  @Column({ default: false })
  read: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
