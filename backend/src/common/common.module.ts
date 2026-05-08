import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemConfig } from '../database/entities/system-config.entity';
import { Notification } from '../database/entities/notification.entity';
import { SystemConfigService } from './services/system-config.service';
import { NotificationsService } from './services/notifications.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([SystemConfig, Notification])],
  providers: [SystemConfigService, NotificationsService],
  exports: [SystemConfigService, NotificationsService],
})
export class CommonModule {}
