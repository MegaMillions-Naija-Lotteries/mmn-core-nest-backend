import { Body, Controller, HttpCode, HttpStatus, Post, Version } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto";

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @HttpCode(HttpStatus.CREATED)
    @Version('1')
    @Post('signup')
    signup(@Body() dto: AuthDto) {
        return this.authService.signup(dto)
    }

    @HttpCode(HttpStatus.OK)
    @Version('1')
    @Post('login')
    login(@Body() dto: AuthDto) {
        return this.authService.login(dto)
    }
}

