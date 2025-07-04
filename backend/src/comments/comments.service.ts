// src/comments/comments.service.ts
import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TreeRepository } from 'typeorm';
import { Comment } from './comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { User } from '../users/user.entity';

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);

  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: TreeRepository<Comment>,
  ) {}

  async create(dto: CreateCommentDto, user: Partial<User>): Promise<Comment> {
    const comment = this.commentRepo.create({
      content: dto.content,
      author: user as User,
    });

    if (dto.parentId) {
      const parent = await this.commentRepo.findOne({
        where: { id: dto.parentId },
      });

      if (!parent) {
        this.logger.warn(`Parent comment ${dto.parentId} not found`);
        throw new NotFoundException('Parent comment not found');
      }

      comment.parent = parent;
    }

    const saved = await this.commentRepo.save(comment);
    this.logger.log(`Comment ${saved.id} created by user ${user.id}`);
    return saved;
  }

  async findAll(): Promise<Comment[]> {
    const comments = await this.commentRepo.findTrees();
    this.logger.log(`Fetched ${comments.length} root-level comments with replies`);
    return comments;
  }

  async updateComment(id: string, content: string, userId: string): Promise<Comment> {
    const comment = await this.commentRepo.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.author.id !== userId)
      throw new UnauthorizedException('You can only edit your own comment');

    comment.content = content;
    const updated = await this.commentRepo.save(comment);
    this.logger.log(`Comment ${id} updated by user ${userId}`);
    return updated;
  }

  async deleteComment(id: string, userId: string): Promise<{ message: string }> {
    const comment = await this.commentRepo.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.author.id !== userId)
      throw new UnauthorizedException('You can only delete your own comment');

    await this.commentRepo.softDelete(id);
    this.logger.log(`Comment ${id} soft-deleted by user ${userId}`);
    return { message: 'Comment deleted' };
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
