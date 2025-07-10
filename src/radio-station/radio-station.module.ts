import { Module } from '@nestjs/common';
import { RadioStationService } from './radio-station.service';
import { RadioStationController } from './radio-station.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [RadioStationController],
  providers: [RadioStationService],
  exports: [RadioStationService],
})
export class RadioStationModule {}