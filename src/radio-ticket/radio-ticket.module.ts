import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { RadioTicketService } from './radio-ticket.service';
import { RadioTicketController } from './radio-ticket.controller';
import { AuthService } from 'src/auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [DatabaseModule, JwtModule.register({}), ConfigModule],
    providers: [RadioTicketService, AuthService],
    controllers: [RadioTicketController]
})
export class RadioTicketModule {}
