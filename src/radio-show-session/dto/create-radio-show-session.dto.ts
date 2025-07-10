
import { IsInt, IsOptional, IsString, IsDateString, IsIn } from 'class-validator';

export class CreateRadioShowSessionDto {
  @IsInt()
  showId: number;
}
