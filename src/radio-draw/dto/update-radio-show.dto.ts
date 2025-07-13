import { IsOptional, IsString, IsInt, IsArray } from 'class-validator';

export class UpdateRadioShowDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  stationId?: number;

  @IsOptional()
  @IsArray()
  days?: string[];

  @IsOptional()
  @IsString()
  airTime?: string;
} 