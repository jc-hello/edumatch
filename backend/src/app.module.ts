import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import configuration from './config/configuration';
import { CommonModule } from './common/common.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TutorsModule } from './modules/tutors/tutors.module';
import { AvailabilityModule } from './modules/availability/availability.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import {
  User,
  TutorProfile,
  Subject,
  EducationLevel,
  TutorSubject,
  AvailabilitySlot,
  Booking,
  Session,
  Payment,
  Payout,
  Review,
  Notification,
  Favorite,
  Report,
  AuditLog,
  TokenBlacklist,
  SystemConfig,
} from './database/entities';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        database: configService.get<string>('database.name'),
        username: configService.get<string>('database.user'),
        password: configService.get<string>('database.password'),
        entities: [
          User,
          TutorProfile,
          Subject,
          EducationLevel,
          TutorSubject,
          AvailabilitySlot,
          Booking,
          Session,
          Payment,
          Payout,
          Review,
          Notification,
          Favorite,
          Report,
          AuditLog,
          TokenBlacklist,
          SystemConfig,
        ],
        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
        synchronize: false,
        logging: configService.get<string>('app.nodeEnv') === 'development',
      }),
      inject: [ConfigService],
    }),
    // Global rate limiter: 100 req / 60s per IP (default)
    // Auth-sensitive routes override with @Throttle({ default: { limit: 5, ttl: 60000 } })
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60_000,
        limit: 500,
      },
    ]),
    ScheduleModule.forRoot(),
    CommonModule,
    AuthModule,
    UsersModule,
    TutorsModule,
    AvailabilityModule,
    BookingsModule,
  ],
  providers: [
    // Apply ThrottlerGuard globally — routes can override with @Throttle or @SkipThrottle
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
