import { IsUUID, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddSubjectDto {
  @ApiProperty()
  @IsUUID()
  subjectId: string;

  @ApiProperty()
  @IsUUID()
  levelId: string;

  @ApiProperty({ example: 200000 })
  @IsNumber()
  @Min(1)
  pricePerHour: number;
}

export class UpdateSubjectPriceDto {
  @ApiProperty({ example: 250000 })
  @IsNumber()
  @Min(1)
  pricePerHour: number;
}
