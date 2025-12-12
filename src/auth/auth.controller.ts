import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOperation, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Body, Controller, HttpCode, HttpStatus, Post, Version } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto";

@Controller('auth')
@ApiTags('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @HttpCode(HttpStatus.CREATED)
    @Version('1')
    @Post('signup')
    @ApiOperation({ summary: 'Create a new user' })
    @ApiBody({ type: AuthDto })
    @ApiResponse({ status: HttpStatus.CREATED, type: AuthDto })
    signup(@Body() dto: AuthDto) {
        return this.authService.signup(dto)
    }

    @HttpCode(HttpStatus.OK)
    @Version('1')
    @Post('login')
    @ApiOperation({ summary: 'Login to the application' })
    @ApiBody({ type: AuthDto })
    @ApiResponse({ status: HttpStatus.OK, type: AuthDto })
    login(@Body() dto: AuthDto) {
        return this.authService.login(dto)
    }
}
