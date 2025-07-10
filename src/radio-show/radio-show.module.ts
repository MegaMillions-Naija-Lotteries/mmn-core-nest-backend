import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { RadioShowService } from './radio-show.service';
import { RadioShowController } from './radio-show.controller';

@Module({
    imports: [DatabaseModule],
    providers: [RadioShowService],
    controllers: [RadioShowController]
})
export class RadioShowModule {}