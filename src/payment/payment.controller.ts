import { Controller, Post, Body, Get, Param, UseGuards, Version } from '@nestjs/common';
import { PaystackService } from '../paystack/paystack.service';
import { WebhookGuard } from '../paystack/guards/webhook.guard';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { InitializeTransactionDto } from '../paystack/dto/initialize-transaction.dto';
import { CreateCustomerDto } from '../paystack/dto/create-customer.dto';

@Controller('payment')
export class PaymentController {
  constructor(private paystackService: PaystackService) {}

  @Post('initialize')
  @Version('1')
  @UseGuards(JwtGuard)
  async initializePayment(@Body() dto: InitializeTransactionDto) {
    return this.paystackService.initializeTransaction(dto);
  }

  @Get('verify/:reference')
  @Version('1')
  @UseGuards(JwtGuard)
  async verifyPayment(@Param('reference') reference: string) {
    return this.paystackService.verifyTransaction(reference);
  }

  @Post('customer')
  @Version('1')
  @UseGuards(JwtGuard)
  async createCustomer(@Body() dto: CreateCustomerDto) {
    return this.paystackService.createCustomer(dto);
  }

  @Get('banks')
  @Version('1')
  @UseGuards(JwtGuard)
  async getBanks() {
    return this.paystackService.listBanks({ country: 'nigeria' });
  }

  @Post('webhook')
  @UseGuards(WebhookGuard)
  @Version('1')
  async handleWebhook(@Body() payload: any) {
    const { event } = payload;

    switch (event) {
      case 'charge.success':
        // TODO: Handle successful payment
        break;
      case 'charge.failed':
        // TODO: Handle failed payment
        break;
      default:
        break;
    }

    return { status: 'success' };
  }
}
