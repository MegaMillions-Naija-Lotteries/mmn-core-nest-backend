import { IsEnum, IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { radioJackpotDraws } from '../../database/schema';

export class CreateRadioJackpotDrawDto {
  @IsString() title: string;
  @IsOptional() @IsString() description?: string;
  @IsNumber() stationId?: number;

  @IsOptional()
  @IsNumber() 
  showId?: number;

  drawPeriod: typeof radioJackpotDraws.$inferSelect['drawPeriod'];
  @IsDateString() periodStart: Date;
  @IsDateString() periodEnd: Date;
  @IsDateString() scheduledAt: Date;
  @IsString() prizeAmount: string;
}