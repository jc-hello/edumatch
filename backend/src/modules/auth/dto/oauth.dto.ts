import { IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OAuthDto {
  @ApiProperty({ enum: ['google', 'facebook'] })
  @IsIn(['google', 'facebook'])
  provider: 'google' | 'facebook';

  @ApiProperty()
  @IsString()
  idToken: string;
}
