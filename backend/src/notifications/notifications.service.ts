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

  async getUserByUsername(username: string) {
    const userRepo = this.notificationRepo.manager.getRepository(User);
    return userRepo.findOne({ where: { username } });
  }

  async findForUser(userId: string) {
    return this.notificationRepo.find({
      where: { recipient: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findRecentForUser(userId: string, limit: number = 5) {
    return this.notificationRepo.find({
      where: { recipient: { id: userId } },
      order: { createdAt: 'DESC' },
      take: limit,
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

  async fetchAndMarkAllReadByUsername(username: string) {
    const userRepo = this.notificationRepo.manager.getRepository(User);
    const user = await userRepo.findOne({ where: { username } });

    if (!user) throw new Error('User not found');

    const notifs = await this.notificationRepo.find({
      where: { recipient: { id: user.id } },
      order: { createdAt: 'DESC' },
    });

    for (const notif of notifs) {
      if (!notif.read) {
        notif.read = true;
      }
    }

    await this.notificationRepo.save(notifs);
    return notifs;
  }
}
