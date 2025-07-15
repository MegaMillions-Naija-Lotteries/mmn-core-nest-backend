import { IsString, IsInt, IsArray, ArrayNotEmpty, IsMilitaryTime, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateRadioDrawDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    description?: string;

    @IsInt()
    sessionId: number;

    @IsInt()
    showId: number;

    @IsInt()
    drawNumber: number;

    @IsString()
    scheduledAt: string;

    @IsString()
    @IsOptional()
    conductedAt?: string;

    @IsInt()
    @IsOptional()
    winningTicketId?: number;

    @IsString()
    status: "pending" | "active" | "completed" | "cancelled";

    @IsInt()
    @IsOptional()
    maxEntries?: number;

    @IsString()
    @IsOptional()
    entryDeadline?: string;

    @IsArray()
    @IsOptional()
    prizes?: any[];

    @IsArray()
    @IsOptional()
    drawSettings?: any[];

    @IsArray()
    @IsOptional()
    winnerDetails?: any[];

    @IsInt()
    @IsOptional()
    totalEntries?: number;

    @IsString()
    @IsOptional()
    createdAt?: string;

    @IsString()
    @IsOptional()
    updatedAt?: string;
}
