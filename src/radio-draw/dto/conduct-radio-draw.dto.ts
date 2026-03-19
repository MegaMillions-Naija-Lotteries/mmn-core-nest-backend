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
    @IsNotEmpty()
    title: string;

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
