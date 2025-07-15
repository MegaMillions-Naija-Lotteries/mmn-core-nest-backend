import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { RadioJackpotDrawController } from './radio-jackpot-draw.controller';
import { RadioJackpotDrawService } from './radio-jackpot-draw.service';

@Module({
  imports: [DatabaseModule],
  controllers: [RadioJackpotDrawController],
  providers: [RadioJackpotDrawService],
  exports: [RadioJackpotDrawService],
})
export class RadioJackpotDrawModule {}