import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Tree, TreeChildren, TreeParent,} from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
@Tree('closure-table')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @ManyToOne(() => User, (user) => user.comments, { eager: true })
  author: User;

  @TreeChildren()
  replies: Comment[];

  @TreeParent()
  parent: Comment;

  @CreateDateColumn({ type: 'timestamptz' }) // << use UTC timestamp
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt?: Date;

}