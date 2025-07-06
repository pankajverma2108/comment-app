// src/notifications/notifications.controller.ts

import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  async getMyNotifications(@Request() req) {
    return this.notificationsService.findForUser(req.user.id);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Request() req) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  @Get('user/:username')
  async getAndMarkByUsername(@Param('username') username: string) {
    try {
      return await this.notificationsService.fetchAndMarkAllReadByUsername(username);
    } catch (e) {
      throw new NotFoundException('Could not fetch notifications');
    }
  }

  @Get('user/:username/preview')
async preview(@Param('username') username: string) {
  const user = await this.notificationsService.getUserByUsername(username);
  if (!user) {
    throw new NotFoundException('User not found');
  }
  return this.notificationsService.findRecentForUser(user.id, 5);
}
}
