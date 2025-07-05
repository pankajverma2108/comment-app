import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { Notification } from './notification.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Notification]), UsersModule],
  providers: [NotificationsService],
  controllers: [NotificationsController],
  exports: [NotificationsService], 
})
export class NotificationsModule {}
