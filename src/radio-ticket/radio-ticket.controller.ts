import { BadRequestException, Body, Controller, Get, Param, Post, Query, Res, UseGuards, Version } from '@nestjs/common';
import { RadioTicketService } from './radio-ticket.service';
import { JwtGuard } from 'src/auth/guard';
import { RolesGuard } from 'src/auth/roles/roles.guard';
import { GetUser } from 'src/auth/decorator';
import { HttpModule } from '@nestjs/axios';
import { PaystackService } from '../paystack/paystack.service';
import { Public } from 'src/auth/decorator/public.decorator';
import { Response } from 'express';

@UseGuards(JwtGuard, RolesGuard)
@Controller('tickets')
export class RadioTicketController {
    constructor(private readonly radioTicketService: RadioTicketService) {}

    @Get('run/test')
    async test() {
        return 'test';
    }
    
    @Post('purchase')
    @Version('1')
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

    @Public()
    @Post('guest-purchase')
    @Version('1')
    async initGuestRadioTicketPurchase(
        @Body('phone') phone: string,
        @Body('stationId') stationId: number,
        @Body('quantity') quantity: number,
        @Body('paymentMethod') paymentMethod: string,
        @Body('drawId') drawId?: number,

    ) {
        // Validate required parameters
        if (!phone) {
            throw new BadRequestException('Phone number is required');
        }
        if (!stationId) {
            throw new BadRequestException('Station ID is required');
        }
        if (!quantity || quantity < 1) {
            throw new BadRequestException('Valid quantity is required');
        }
        if (!paymentMethod) {
            throw new BadRequestException('Payment method is required');
        }

        return this.radioTicketService.initGuestRadioTicketPurchase({
            phone,
            stationId,
            drawId,
            quantity,
            paymentMethod,
        });
    }

    @Public()
    @Get('verify-payment')
    @Version('1')
    async verifyRadioTicketPurchase(
        @Query('reference') reference: string,
        paymentmethod: string,
        @Res() res: Response,
        // @Body('paymentmethod') paymentmethod: number
    ){
        return this.radioTicketService.verifyRadioTicketPayment(
            reference,
            'paystack'
        ).then((result) => {
            res.redirect(`https://8aa0c37fbc76.ngrok-free.app/verify-payment?reference=${reference}`);
        });
    }

}
