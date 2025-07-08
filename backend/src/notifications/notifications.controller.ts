// src/notifications/notifications.controller.ts

import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  Request,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor(private notificationsService: NotificationsService) {}

  // 🔔 1. Get my notifications (authenticated user)
  @Get()
  async getMyNotifications(@Request() req) {
    this.logger.log(`Fetching notifications for user ID ${req.user.id}`);
    return this.notificationsService.findForUser(req.user.id);
  }

  // 🔔 2. Mark a single notification as read
  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Request() req) {
    this.logger.log(`Marking notification ${id} as read by user ${req.user.id}`);
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  // 🔔 3. Get all by username AND mark them as read (used in full page)
  @Get('user/:username')
  async getAndMarkByUsername(@Param('username') username: string) {
    this.logger.log(`Fetching and marking notifications for ${username}`);
    try {
      return await this.notificationsService.fetchAndMarkAllReadByUsername(username);
    } catch (e) {
      this.logger.warn(`Failed to fetch notifications for ${username}`);
      throw new NotFoundException('Could not fetch notifications');
    }
  }

  // 🔔 4. Get preview for dropdown (latest 5, no mark-read)
  @Get('user/:username/preview')
  async preview(@Param('username') username: string) {
    this.logger.log(`Fetching preview notifications for ${username}`);
    const user = await this.notificationsService.getUserByUsername(username);
    if (!user) throw new NotFoundException('User not found');
    return this.notificationsService.findRecentForUser(user.id, 5);
  }

  @Patch('user/:username')
  async markAllAsRead(@Param('username') username: string) {
    try {
      return await this.notificationsService.fetchAndMarkAllReadByUsername(username);
    } catch (e) {
      throw new NotFoundException('Could not mark notifications as read');
    }
  }

}
