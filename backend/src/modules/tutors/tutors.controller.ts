import {
  Controller,
  Post,
  Put,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { TutorsService } from './tutors.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateTutorProfileDto } from './dto/update-profile.dto';
import { AddSubjectDto, UpdateSubjectPriceDto } from './dto/add-subject.dto';
import { SearchTutorsDto, ListReviewsDto } from './dto/search-tutors.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Tutors')
@Controller('tutors')
export class TutorsController {
  constructor(private readonly service: TutorsService) {}

  // ── Public search & detail ───────────────────────────────────────────
  @Get()
  @ApiOperation({ summary: 'Search & filter approved tutors' })
  @ApiResponse({ status: 200, description: 'Paginated list of tutors' })
  search(@Query() dto: SearchTutorsDto) {
    return this.service.search(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tutor detail (profile + subjects + recent reviews)' })
  @ApiParam({ name: 'id', description: 'Tutor profile ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Tutor detail object' })
  @ApiResponse({ status: 404, description: 'Tutor not found or not approved' })
  getDetail(@Param('id') id: string) {
    return this.service.getDetail(id);
  }

  @Get(':id/reviews')
  @ApiOperation({ summary: 'Paginated reviews of a tutor' })
  getReviews(@Param('id') id: string, @Query() dto: ListReviewsDto) {
    return this.service.listReviews(id, dto);
  }

  // ── Self-management (tutor) ──────────────────────────────────────────
  @Post('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tutor creates own profile (status=pending)' })
  @ApiResponse({ status: 201, description: 'Profile created' })
  @ApiResponse({ status: 403, description: 'Not a tutor account' })
  @ApiResponse({ status: 409, description: 'Profile already exists' })
  createProfile(@Request() req: any, @Body() dto: CreateProfileDto) {
    return this.service.createProfile(req.user.id, req.user.role, dto);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tutor updates own profile (rejected → pending again)' })
  updateProfile(@Request() req: any, @Body() dto: UpdateTutorProfileDto) {
    return this.service.updateProfile(req.user.id, dto);
  }

  @Get('profile/subjects')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List own subjects" })
  listSubjects(@Request() req: any) {
    return this.service.listSubjects(req.user.id);
  }

  @Post('profile/subjects')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add subject + level + price' })
  @ApiResponse({ status: 409, description: 'Subject + level combination already exists' })
  addSubject(@Request() req: any, @Body() dto: AddSubjectDto) {
    return this.service.addSubject(req.user.id, dto);
  }

  @Put('profile/subjects/:tutorSubjectId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update price for a subject' })
  updateSubject(
    @Request() req: any,
    @Param('tutorSubjectId') id: string,
    @Body() dto: UpdateSubjectPriceDto,
  ) {
    return this.service.updateSubjectPrice(req.user.id, id, dto);
  }

  @Delete('profile/subjects/:tutorSubjectId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a subject (blocked if active bookings)' })
  @ApiResponse({ status: 409, description: 'Active bookings exist for this subject' })
  deleteSubject(@Request() req: any, @Param('tutorSubjectId') id: string) {
    return this.service.deleteSubject(req.user.id, id);
  }
}
