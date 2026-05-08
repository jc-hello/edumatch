import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BookingsService } from './bookings.service';

@Injectable()
export class BookingsCron {
  private readonly logger = new Logger(BookingsCron.name);

  constructor(private readonly bookings: BookingsService) {}

  // Every 5 minutes
  @Cron(CronExpression.EVERY_5_MINUTES)
  async autoCancel() {
    try {
      const result = await this.bookings.autoCancelExpired();
      if (result.cancelled > 0) {
        this.logger.log(`auto-cancel cron processed ${result.cancelled} booking(s)`);
      }
    } catch (e: any) {
      this.logger.error(`auto-cancel cron failed: ${e.message}`);
    }
  }
}
