import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly service: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Student creates a booking (locks slot, sets auto-cancel at +24h)' })
  @ApiResponse({ status: 201, description: 'Booking created (status=pending)' })
  @ApiResponse({ status: 409, description: 'Slot already booked' })
  create(@Request() req: any, @Body() dto: CreateBookingDto) {
    return this.service.create(req.user.id, req.user.role, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List my bookings (as student or tutor)' })
  @ApiQuery({ name: 'as', enum: ['student', 'tutor'], required: false })
  list(@Request() req: any, @Query('as') as: 'student' | 'tutor' = 'student') {
    return this.service.listForUser(req.user.id, as);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a booking detail' })
  detail(@Request() req: any, @Param('id') id: string) {
    return this.service.getDetail(req.user.id, req.user.role, id);
  }

  @Post(':id/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tutor confirms a pending booking → creates session' })
  @ApiResponse({ status: 200, description: 'Booking confirmed and session created' })
  @ApiResponse({ status: 409, description: 'Booking is not in pending state' })
  confirm(@Request() req: any, @Param('id') id: string) {
    return this.service.confirm(req.user.id, id);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tutor rejects a pending booking → 100% refund' })
  reject(@Request() req: any, @Param('id') id: string, @Body() dto: CancelBookingDto) {
    return this.service.reject(req.user.id, id, dto);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Cancel a booking. Refund: pending→100%, confirmed >24h→100%, confirmed ≤24h→config[refund_partial_percent]%',
  })
  cancel(@Request() req: any, @Param('id') id: string, @Body() dto: CancelBookingDto) {
    return this.service.cancel(req.user.id, req.user.role, id, dto);
  }
}
