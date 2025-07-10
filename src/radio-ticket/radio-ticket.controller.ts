import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { RadioTicketService } from './radio-ticket.service';
import { JwtGuard } from 'src/auth/guard';
import { RolesGuard } from 'src/auth/roles/roles.guard';
import { GetUser } from 'src/auth/decorator';
import { HttpModule } from '@nestjs/axios';
import { PaystackService } from '../paystack/paystack.service';

@UseGuards(JwtGuard, RolesGuard)
@Controller('radio-tickets')
export class RadioTicketController {
    constructor(private readonly radioTicketService: RadioTicketService) {}


    @Post('init-purchase')
    async initRadioTicketPurchase(
        @Body('stationId') stationId: number,
        @Body('drawId') drawId: number,
        @Body('quantity') quantity: number,
        @Body('paymentMethod') paymentMethod: string,
        @GetUser() user: any,
    ) {
        return this.radioTicketService.initRadioTicketPurchase({
            stationId,
            drawId,
            quantity,
            paymentMethod,
            user,
        });
    }
}
