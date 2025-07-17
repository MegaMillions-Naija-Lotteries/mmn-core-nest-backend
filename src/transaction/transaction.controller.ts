import { Body, Controller, Get, Param, Post, Query, UseGuards, Version } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { Roles } from 'src/auth/roles/roles.decorator';
import { USER_ROLE } from 'src/auth/roles/roles.constant';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { RolesGuard } from 'src/auth/roles/roles.guard';

@UseGuards(JwtGuard, RolesGuard)
@Controller('transactions')      
export class TransactionController {
    constructor(private transactionService: TransactionService) {}

    @Get('/radio')
    @Version('1')
    @Roles(USER_ROLE.ROLE_ADMIN)
    getAllRadioTransactions(
        @Query('stationId') stationId?: number,
        @Query('drawId') drawId?: number,
        @Query('quantity') quantity?: number,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('start_date') startDate?: string,
        @Query('end_date') endDate?: string,
    ) {
        const filter = {
            stationId,
            drawId,
            quantity,
            page,
            limit,
            startDate,
            endDate,
        };
        return this.transactionService.getAllRadioTransactions(filter);
    }

    @Get('/station/:stationId')
    @Version('1')
    // @Roles(USER_ROLE.ROLE_ADMIN)
    getTransactionByStation(
        @Param('stationId') stationId?: number,
        @Query('drawId') drawId?: number,
        @Query('quantity') quantity?: number,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('start_date') startDate?: string,
        @Query('end_date') endDate?: string,
    ) {
        const filter = {
            drawId,
            quantity,
            page,
            limit,
            startDate,
            endDate,
        };
        return this.transactionService.getTransactionByStation(stationId, filter);
    }       
}
