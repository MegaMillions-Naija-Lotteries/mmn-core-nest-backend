import { Module } from '@nestjs/common';
import { RadioTicketController } from 'src/radio-ticket/radio-ticket.controller';
import { RadioTicketService } from 'src/radio-ticket/radio-ticket.service';
import { DatabaseModule } from 'src/database/database.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from 'src/auth/auth.service';
import { RadioStationController } from 'src/radio-station/radio-station.controller';
import { RadioStationService } from 'src/radio-station/radio-station.service';
import { RadioShowController } from 'src/radio-show/radio-show.controller';
import { RadioShowService } from 'src/radio-show/radio-show.service';
import { RadioShowSessionController } from 'src/radio-show-session/radio-show-session.controller';
import { RadioShowSessionService } from 'src/radio-show-session/radio-show-session.service';
import { RadioDrawController } from 'src/radio-draw/radio-draw.controller';
import { RadioDrawService } from 'src/radio-draw/radio-draw.service';

@Module({
    controllers: [RadioTicketController, RadioStationController, RadioShowController, RadioShowSessionController, RadioDrawController],
    providers: [RadioTicketService, AuthService, RadioStationService, RadioShowService, RadioShowSessionService, RadioDrawService],
    imports: [DatabaseModule, JwtModule.register({}), ConfigModule],
})
export class RadioModule {}
