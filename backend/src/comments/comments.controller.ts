// src/comments/comments.controller.ts
import {Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards, Logger,} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { AuthGuard } from '@nestjs/passport';
import { RequestWithUser } from '../common/types/request-with-user';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('comments')
export class CommentsController {
  private readonly logger = new Logger(CommentsController.name);

  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateCommentDto, @Req() req: RequestWithUser) {
    this.logger.log(`User ${req.user.userId} is posting a comment`);
    return this.commentsService.create(dto, { id: req.user.userId });
  }

  @Get()
  async findAll() {
    this.logger.log('Fetching all comments');
    return this.commentsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body('content') content: string,
    @Req() req: RequestWithUser,
  ) {
    this.logger.log(`User ${req.user.userId} is updating comment ${id}`);
    return this.commentsService.updateComment(id, content, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    this.logger.log(`User ${req.user.userId} is deleting comment ${id}`);
    return this.commentsService.deleteComment(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async findMine(@Req() req: RequestWithUser) {
    const userId = req.user.userId;
    this.logger.log(`Fetching comments by user ${userId}`);
    return this.commentsService.findByUserId(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/restore')
  async restore(@Param('id') id: string, @Req() req: RequestWithUser) {
    this.logger.log(`User ${req.user.userId} is attempting to restore comment ${id}`);
    return this.commentsService.restoreComment(id, req.user.userId);
  }
}