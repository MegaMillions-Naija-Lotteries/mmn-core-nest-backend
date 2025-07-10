import { IsString, IsInt, IsArray, ArrayNotEmpty, IsMilitaryTime, IsNotEmpty } from 'class-validator';

export class CreateRadioShowDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    days: string[]; // e.g. ['Monday', 'Wednesday']

    @IsString()
    @IsMilitaryTime()
    airTime: string; // e.g. '14:00:00'

    @IsInt()
    stationId: number;
}
