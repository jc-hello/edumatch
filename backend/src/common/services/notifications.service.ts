import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../database/entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private repo: Repository<Notification>,
  ) {}

  async push(userId: string, type: string, title: string, body: string, data: any = null) {
    const notif = this.repo.create({ userId, type, title, body, data });
    return this.repo.save(notif);
  }
}
