import { PartialType } from '@nestjs/swagger';
import { CreateProfileDto } from './create-profile.dto';

export class UpdateTutorProfileDto extends PartialType(CreateProfileDto) {}
