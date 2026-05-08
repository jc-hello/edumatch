import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { AvailabilityService } from './availability.service';
import { CreateSlotDto, UpdateSlotDto } from './dto/create-slot.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Availability')
@Controller()
export class AvailabilityController {
  constructor(private readonly service: AvailabilityService) {}

  @Post('tutors/availability')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tutor creates availability slot (single or recurring)' })
  @ApiResponse({ status: 201, description: 'Slot(s) created' })
  @ApiResponse({ status: 409, description: 'Overlaps existing slot' })
  createSlot(@Request() req: any, @Body() dto: CreateSlotDto) {
    return this.service.createSlot(req.user.id, dto);
  }

  @Get('tutors/:id/availability')
  @ApiOperation({ summary: 'Get unbooked availability slots for a tutor (default = current week)' })
  @ApiParam({ name: 'id', description: 'Tutor profile ID (UUID)' })
  @ApiQuery({ name: 'week', required: false, description: 'ISO week e.g. 2026-W20' })
  list(@Param('id') tutorProfileId: string, @Query('week') week?: string) {
    return this.service.listForTutor(tutorProfileId, week);
  }

  @Put('tutors/availability/:slotId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an unbooked slot' })
  @ApiResponse({ status: 409, description: 'Slot already booked or overlaps another' })
  update(@Request() req: any, @Param('slotId') id: string, @Body() dto: UpdateSlotDto) {
    return this.service.updateSlot(req.user.id, id, dto);
  }

  @Delete('tutors/availability/:slotId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a slot. Pass ?series=true to delete the whole recurring series.' })
  @ApiQuery({ name: 'series', required: false, type: 'boolean' })
  @ApiResponse({ status: 409, description: 'Slot already booked' })
  remove(
    @Request() req: any,
    @Param('slotId') id: string,
    @Query('series') series?: string,
  ) {
    return this.service.deleteSlot(req.user.id, id, series === 'true');
  }
}
