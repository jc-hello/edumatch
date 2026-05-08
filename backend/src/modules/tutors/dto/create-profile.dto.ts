import {
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
  IsUrl,
  IsObject,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  bio?: string;

  @ApiPropertyOptional({ example: 'https://youtube.com/watch?v=...' })
  @IsOptional()
  @IsUrl()
  videoUrl?: string;

  @ApiPropertyOptional({ example: ['vi', 'en'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @ApiPropertyOptional({ example: [{ school: 'HUST', degree: 'BSc', field: 'CS', yearFrom: 2018, yearTo: 2022 }] })
  @IsOptional()
  @IsArray()
  education?: any[];

  @ApiPropertyOptional({ example: [{ name: 'IELTS 8.0', issuer: 'IDP', year: 2024, fileUrl: 'https://...' }] })
  @IsOptional()
  @IsArray()
  certificates?: any[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  teachesOnline?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  teachesOffline?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;
}
