import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { RadioDrawController } from './radio-draw.controller';
import { RadioDrawService } from './radio-draw.service';

@Module({
  imports: [DatabaseModule],
  controllers: [RadioDrawController],
  providers: [RadioDrawService],
  exports: [RadioDrawService],
})
export class RadioDrawModule {}