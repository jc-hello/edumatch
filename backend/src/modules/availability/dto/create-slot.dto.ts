import {
  IsDateString,
  IsBoolean,
  IsOptional,
  IsInt,
  IsArray,
  ArrayMaxSize,
  ArrayMinSize,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSlotDto {
  @ApiProperty({ example: '2026-05-15T09:00:00Z' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ example: '2026-05-15T11:00:00Z' })
  @IsDateString()
  endTime: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @ApiPropertyOptional({ example: 8, description: 'Number of weeks to repeat (1-12)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  recurringWeeks?: number;

  @ApiPropertyOptional({
    description: 'Days of week (0=Sun..6=Sat). If empty + isRecurring, uses startTime weekday.',
    example: [1, 3, 5],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(7)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  daysOfWeek?: number[];
}

export class UpdateSlotDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endTime?: string;
}
