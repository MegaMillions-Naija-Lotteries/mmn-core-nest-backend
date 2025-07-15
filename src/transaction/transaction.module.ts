import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [TransactionController],
  providers: [TransactionService]
})
export class TransactionModule {}
