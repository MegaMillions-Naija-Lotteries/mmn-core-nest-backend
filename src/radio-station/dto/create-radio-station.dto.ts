import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateRadioStationDto {
    @IsString()
    name: string;

    @IsString()
    link: string;

    @IsString()
    logo: string;

    @IsOptional()
    @IsBoolean()
    isActive: boolean;
}
