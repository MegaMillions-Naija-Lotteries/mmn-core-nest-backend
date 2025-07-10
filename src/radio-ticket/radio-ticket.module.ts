import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { RadioTicketService } from './radio-ticket.service';
import { RadioTicketController } from './radio-ticket.controller';

@Module({
    imports:[DatabaseModule],
    providers: [RadioTicketService],
    controllers: [RadioTicketController]
})
export class RadioTicketModule {}
