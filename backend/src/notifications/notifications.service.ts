import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { User } from '../users/user.entity';
import { Comment } from '../comments/comment.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
  ) {}

  async create(recipient: User, commentId: string) {
    const commentRepo = this.notificationRepo.manager.getRepository(Comment);
    const comment = await commentRepo.findOne({ where: { id: commentId } });

    if (!comment) {
      throw new Error(`Comment with id ${commentId} not found`);
    }

    const notification = this.notificationRepo.create({
      recipient: { id: recipient.id } as User,
      comment: { id: comment.id } as Comment,
    });

    return this.notificationRepo.save(notification);
  }

  async findForUser(userId: string) {
    return this.notificationRepo.find({
      where: { recipient: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: string, userId: string) {
    const notif = await this.notificationRepo.findOne({
      where: { id, recipient: { id: userId } },
    });
    if (notif) {
      notif.read = true;
      await this.notificationRepo.save(notif);
    }
    return notif;
  }
}
