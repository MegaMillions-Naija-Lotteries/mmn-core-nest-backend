import { IsNumber, IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";

export class ConductRadioJackpotDrawDto {
    @IsNumber()
    @IsNotEmpty()
    sessionId: number;

    @IsNumber()
    @IsNotEmpty()
    showId: number;

    @IsNumber()
    @IsNotEmpty()
    drawNumber: number;

    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @IsOptional()
    maxEntries?: number;

    @IsObject()
    @IsOptional()
    prizes?: any;

    @IsObject()
    @IsOptional()
    drawSettings?: any;

    @IsString()
    entryDeadline?: string;

    
}
