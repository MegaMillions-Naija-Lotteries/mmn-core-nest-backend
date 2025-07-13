import { IsNumber, IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";

export class ConductRadioDrawDto {
    @IsNumber()
    @IsNotEmpty()
    sessionId: number;

    @IsNumber()
    @IsNotEmpty()
    showId: number;

    @IsObject()
    @IsOptional()
    drawSettings: any;

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
}
