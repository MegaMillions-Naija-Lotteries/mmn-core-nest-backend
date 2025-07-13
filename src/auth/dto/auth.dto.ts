import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator"

export class AuthDto {
    @IsEmail()
        email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsOptional()
    phone?: string;
}