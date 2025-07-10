import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { RadioShowSessionController } from './radio-show-session.controller';
import { RadioShowSessionService } from './radio-show-session.service';

@Module({
    imports: [DatabaseModule],
    controllers: [RadioShowSessionController],
    providers: [RadioShowSessionService]
})
export class RadioShowSessionModule {}
