import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { AvailabilitySlot } from '../../database/entities/availability-slot.entity';
import { TutorProfile, TutorStatus } from '../../database/entities/tutor-profile.entity';
import { CreateSlotDto, UpdateSlotDto } from './dto/create-slot.dto';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(AvailabilitySlot) private slotRepo: Repository<AvailabilitySlot>,
    @InjectRepository(TutorProfile) private profileRepo: Repository<TutorProfile>,
    private dataSource: DataSource,
  ) {}

  private async getTutorProfile(userId: string) {
    const p = await this.profileRepo.findOne({ where: { userId } });
    if (!p) throw new NotFoundException('Tutor profile not found');
    return p;
  }

  private validateRange(start: Date, end: Date) {
    if (end <= start) throw new BadRequestException('endTime must be after startTime');
    const hours = (end.getTime() - start.getTime()) / 3_600_000;
    if (hours > 8) throw new BadRequestException('Slot duration must be <= 8 hours');
    if (hours < 0.5) throw new BadRequestException('Slot duration must be >= 30 minutes');
    if (start <= new Date()) throw new BadRequestException('Slot must start in the future');
  }

  private async assertNoOverlap(tutorId: string, start: Date, end: Date) {
    // Overlap: NOT (existing.end <= new.start OR existing.start >= new.end)
    const overlap = await this.slotRepo
      .createQueryBuilder('s')
      .where('s.tutor_id = :tid', { tid: tutorId })
      .andWhere('s.start_time < :end', { end })
      .andWhere('s.end_time > :start', { start })
      .getOne();
    if (overlap) {
      throw new ConflictException(`Slot overlaps with existing slot ${overlap.id}`);
    }
  }

  async createSlot(userId: string, dto: CreateSlotDto) {
    const profile = await this.getTutorProfile(userId);
    if (profile.status !== TutorStatus.APPROVED) {
      throw new ForbiddenException('Only approved tutors can publish availability');
    }

    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);
    this.validateRange(start, end);

    if (!dto.isRecurring) {
      await this.assertNoOverlap(profile.id, start, end);
      const slot = this.slotRepo.create({
        tutorId: profile.id,
        startTime: start,
        endTime: end,
        isRecurring: false,
      });
      return this.slotRepo.save(slot);
    }

    // Recurring: expand into N weeks across selected weekdays
    const weeks = dto.recurringWeeks ?? 8;
    const days = dto.daysOfWeek?.length ? dto.daysOfWeek : [start.getUTCDay()];
    const groupId = uuidv4();
    const created: AvailabilitySlot[] = [];
    const skipped: { startTime: string; reason: string }[] = [];

    // Anchor to the Sunday of the start week (UTC) for predictable expansion
    const baseSunday = new Date(start);
    baseSunday.setUTCDate(baseSunday.getUTCDate() - baseSunday.getUTCDay());
    baseSunday.setUTCHours(0, 0, 0, 0);

    const startTimeOfDay = {
      h: start.getUTCHours(),
      m: start.getUTCMinutes(),
    };
    const durationMs = end.getTime() - start.getTime();

    for (let w = 0; w < weeks; w++) {
      for (const dow of days) {
        const slotStart = new Date(baseSunday);
        slotStart.setUTCDate(baseSunday.getUTCDate() + w * 7 + dow);
        slotStart.setUTCHours(startTimeOfDay.h, startTimeOfDay.m, 0, 0);
        const slotEnd = new Date(slotStart.getTime() + durationMs);
        if (slotStart <= new Date()) continue; // skip past

        try {
          await this.assertNoOverlap(profile.id, slotStart, slotEnd);
          const s = this.slotRepo.create({
            tutorId: profile.id,
            startTime: slotStart,
            endTime: slotEnd,
            isRecurring: true,
            recurringGroupId: groupId,
          });
          created.push(await this.slotRepo.save(s));
        } catch (e: any) {
          skipped.push({ startTime: slotStart.toISOString(), reason: e.message });
        }
      }
    }

    return { recurringGroupId: groupId, created: created.length, skipped, slots: created };
  }

  async listForTutor(profileId: string, week?: string) {
    const profile = await this.profileRepo.findOne({ where: { id: profileId } });
    if (!profile) throw new NotFoundException('Tutor not found');

    let from: Date;
    let to: Date;
    if (week && /^\d{4}-W\d{2}$/.test(week)) {
      const [y, w] = week.split('-W').map(Number);
      from = isoWeekStart(y, w);
      to = new Date(from.getTime() + 7 * 86_400_000);
    } else {
      // default = current week (UTC, Mon..Sun)
      const now = new Date();
      const day = now.getUTCDay() === 0 ? 7 : now.getUTCDay();
      from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - (day - 1)));
      to = new Date(from.getTime() + 7 * 86_400_000);
    }

    return this.slotRepo
      .createQueryBuilder('s')
      .where('s.tutor_id = :tid', { tid: profile.id })
      .andWhere('s.is_booked = false')
      .andWhere('s.start_time >= :from', { from })
      .andWhere('s.start_time < :to', { to })
      .orderBy('s.start_time', 'ASC')
      .getMany();
  }

  async updateSlot(userId: string, slotId: string, dto: UpdateSlotDto) {
    const profile = await this.getTutorProfile(userId);
    const slot = await this.slotRepo.findOne({ where: { id: slotId } });
    if (!slot || slot.tutorId !== profile.id) throw new NotFoundException('Slot not found');
    if (slot.isBooked) throw new ConflictException('Cannot modify a booked slot');

    const newStart = dto.startTime ? new Date(dto.startTime) : slot.startTime;
    const newEnd = dto.endTime ? new Date(dto.endTime) : slot.endTime;
    this.validateRange(newStart, newEnd);

    // overlap check excluding self
    const overlap = await this.slotRepo
      .createQueryBuilder('s')
      .where('s.tutor_id = :tid', { tid: profile.id })
      .andWhere('s.id != :sid', { sid: slot.id })
      .andWhere('s.start_time < :end', { end: newEnd })
      .andWhere('s.end_time > :start', { start: newStart })
      .getOne();
    if (overlap) throw new ConflictException(`Slot overlaps with existing slot ${overlap.id}`);

    slot.startTime = newStart;
    slot.endTime = newEnd;
    return this.slotRepo.save(slot);
  }

  async deleteSlot(userId: string, slotId: string, deleteSeries: boolean) {
    const profile = await this.getTutorProfile(userId);
    const slot = await this.slotRepo.findOne({ where: { id: slotId } });
    if (!slot || slot.tutorId !== profile.id) throw new NotFoundException('Slot not found');
    if (slot.isBooked) throw new ConflictException('Cannot delete a booked slot');

    if (deleteSeries && slot.recurringGroupId) {
      const result = await this.slotRepo
        .createQueryBuilder()
        .delete()
        .where('recurring_group_id = :gid', { gid: slot.recurringGroupId })
        .andWhere('is_booked = false')
        .execute();
      return { message: 'Recurring series deleted', deletedCount: result.affected };
    }

    await this.slotRepo.delete(slot.id);
    return { message: 'Slot deleted' };
  }
}

// ISO week start (Monday) helper
function isoWeekStart(year: number, week: number): Date {
  const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
  const dow = simple.getUTCDay();
  const isoDow = dow === 0 ? 7 : dow;
  simple.setUTCDate(simple.getUTCDate() - (isoDow - 1));
  simple.setUTCHours(0, 0, 0, 0);
  return simple;
}
