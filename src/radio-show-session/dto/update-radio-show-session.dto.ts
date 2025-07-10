
import { IsOptional, IsIn, IsDateString } from 'class-validator';

export class UpdateRadioShowSessionDto {
  @IsOptional()
  @IsIn(['active', 'ended', 'paused'])
  status?: 'active' | 'ended' | 'paused';

  @IsOptional()
  @IsDateString()
  endTime?: string;
}
