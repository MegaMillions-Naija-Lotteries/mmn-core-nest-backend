import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { users } from '../database/user.entity';
import { EditUserDto } from './dto';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {

    constructor(private userService:UserService) {}
    @Get('me')
    getMe(@GetUser() user: typeof users.$inferSelect) {
        return user;
    }

    @Patch()
    editUser(@GetUser('id') userId:number,
     @Body() dto:EditUserDto) {
        return this.userService.editUser(userId, dto);
     }
}
