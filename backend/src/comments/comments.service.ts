// src/comments/comments.service.ts
import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TreeRepository } from 'typeorm';
import { Comment } from './comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { User } from '../users/user.entity';
import { plainToInstance } from 'class-transformer';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);

  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: TreeRepository<Comment>,
  private readonly notificationsService: NotificationsService, 
  ) {}

async create(dto: CreateCommentDto, user: Partial<User>): Promise<Comment> {
  const author = await this.commentRepo.manager.getRepository(User).findOne({
    where: { id: user.id },
  });

  if (!author) {
    this.logger.warn(`User ${user.id} not found when creating comment`);
    throw new NotFoundException('User not found');
  }

  const comment = this.commentRepo.create({
    content: dto.content,
    author,
  });

  if (dto.parentId) {
    const parent = await this.commentRepo.findOne({
      where: { id: dto.parentId },
      relations: ['author'], // needed for notifications
    });

    if (!parent) {
      this.logger.warn(`Parent comment ${dto.parentId} not found`);
      throw new NotFoundException('Parent comment not found');
    }

    comment.parent = parent;

    // 🔔 Trigger notification if replying to someone else's comment
    if (parent.author && parent.author.id !== author.id) {
      await this.notificationsService.create(parent.author, comment.id);
    }
  }

  const saved = await this.commentRepo.save(comment);
  this.logger.log(`Comment ${saved.id} created by user ${author.id}`);
  return saved;
}

async findAll(): Promise<Comment[]> {
  this.logger.log('Fetching all comments (including soft-deleted)');

  const flatComments = await this.commentRepo.find({
    relations: ['parent', 'author'],
    withDeleted: true,
    order: { createdAt: 'ASC' },
  });

  this.logger.log(`Fetched ${flatComments.length} total comments`);

  const commentMap = new Map<string, Comment>();
  const roots: Comment[] = [];

  for (const comment of flatComments) {
    if (comment.deletedAt) {
      this.logger.debug(`Sanitizing deleted comment ${comment.id}`);
      comment.content = '[deleted]';
      (comment as any).author = null;
    }

    comment.replies = [];
    commentMap.set(comment.id, comment);
  }

  for (const comment of flatComments) {
    if (comment.parent) {
      const parent = commentMap.get(comment.parent.id);
      if (parent) {
        parent.replies.push(comment);
        this.logger.debug(`Attached comment ${comment.id} as reply to ${parent.id}`);
      } else {
        this.logger.warn(`Parent ${comment.parent.id} not found in map for comment ${comment.id}`);
      }
    } else {
      roots.push(comment);
      this.logger.debug(`Comment ${comment.id} is a root-level comment`);
    }
  }

  this.logger.log(`Built threaded comment tree with ${roots.length} root comments`);

  // Strip password from author using class-transformer
  return plainToInstance(Comment, roots);
}

  async updateComment(id: string, content: string, userId: string) {
    const comment = await this.commentRepo.findOne({ where: { id }, relations: ['author'] });

    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.author.id !== userId) throw new UnauthorizedException('You can only edit your own comment');

    const now = new Date();
    const diffMs = now.getTime() - comment.createdAt.getTime();
    const diffMinutes = diffMs / (1000 * 60);

    if (diffMinutes > 15) {
      this.logger.warn(`Edit time expired for comment ${id}`);
      throw new ForbiddenException('You can only edit a comment within 15 minutes of posting');
    }

    comment.content = content;
    const updated = await this.commentRepo.save(comment);
    this.logger.log(`Comment ${id} updated by user ${userId}`);
    return updated;
  }

async deleteComment(id: string, userId: string) {
  const comment = await this.commentRepo.findOne({
    where: { id },
    relations: ['author'],
    withDeleted: true,
  });

  if (!comment) throw new NotFoundException('Comment not found');
  if (comment.author.id !== userId)
    throw new UnauthorizedException('You can only delete your own comment');

  const nowUtc = new Date();
  const createdUtc = comment.createdAt;

  const diffMinutes = (nowUtc.getTime() - createdUtc.getTime()) / (1000 * 60);

  this.logger.debug(`Comment ${id} created at ${createdUtc.toISOString()}, now is ${nowUtc.toISOString()}, diff = ${diffMinutes.toFixed(2)} mins`);

  if (diffMinutes > 15) {
    this.logger.warn(`Delete time expired for comment ${id} (${diffMinutes.toFixed(2)} mins)`);
    throw new ForbiddenException('You can only delete a comment within 15 minutes of posting');
  }

  await this.commentRepo.softDelete(id);
  this.logger.log(`Comment ${id} soft-deleted by user ${userId}`);
  return { message: 'Comment deleted' };
}

  async restoreComment(id: string, userId: string) {
  const comment = await this.commentRepo.findOne({
    where: { id },
    withDeleted: true,
    relations: ['author'],
  });

  if (!comment) throw new NotFoundException('Comment not found');
  if (!comment.deletedAt) throw new ForbiddenException('Comment is not deleted');
  if (comment.author.id !== userId)
    throw new UnauthorizedException('You can only restore your own comment');

  const nowUtc = new Date();
  const deletedUtc = comment.deletedAt;

  const diffMinutes = (nowUtc.getTime() - deletedUtc.getTime()) / (1000 * 60);

  this.logger.debug(`Comment ${id} was deleted at ${deletedUtc.toISOString()}, now is ${nowUtc.toISOString()}, diff = ${diffMinutes.toFixed(2)} mins`);

  if (diffMinutes > 15) {
    this.logger.warn(`Restore time expired for comment ${id} (${diffMinutes.toFixed(2)} mins)`);
    throw new ForbiddenException('Restore window expired');
  }

  await this.commentRepo.restore(id);
  this.logger.log(`Comment ${id} restored by user ${userId}`);
  return { message: 'Comment restored' };
}


  async findByUserId(userId: string): Promise<Comment[]> {
    const comments = await this.commentRepo.find({
      where: { author: { id: userId } },
      relations: ['parent', 'replies'],
      order: { createdAt: 'DESC' },
    });

    this.logger.log(`Found ${comments.length} comments for user ${userId}`);
    return comments;
  }
}
