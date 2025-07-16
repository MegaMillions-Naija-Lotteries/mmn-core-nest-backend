import { Controller, Post, Body, Get, Param, UseGuards, Version } from '@nestjs/common';
import { PaystackService } from '../paystack/paystack.service';
import { WebhookGuard } from '../paystack/guards/webhook.guard';
import { InitializeTransactionDto } from '../paystack/dto/initialize-transaction.dto';
import { CreateCustomerDto } from '../paystack/dto/create-customer.dto';

@Controller('payment')
export class PaymentController {
  constructor(private paystackService: PaystackService) {}

  @Post('initialize')
  @Version('1')
  async initializePayment(@Body() dto: InitializeTransactionDto) {
    return this.paystackService.initializeTransaction(dto);
  }

  @Get('verify/:reference')
  @Version('1')
  async verifyPayment(@Param('reference') reference: string) {
    return this.paystackService.verifyTransaction(reference);
  }

  @Post('customer')
  @Version('1')
  async createCustomer(@Body() dto: CreateCustomerDto) {
    return this.paystackService.createCustomer(dto);
  }

  @Get('banks')
  @Version('1')
  async getBanks() {
    return this.paystackService.listBanks({ country: 'nigeria' });
  }

  @Post('webhook')
  @UseGuards(WebhookGuard)
  @Version('1')
  async handleWebhook(@Body() payload: any) {
    // Handle webhook events
    const { event, data } = payload;
    
    switch (event) {
      case 'charge.success':
        // Handle successful payment
        console.log('Payment successful:', data);
        break;
      case 'charge.failed':
        // Handle failed payment
        console.log('Payment failed:', data);
        break;
      default:
        console.log('Unhandled event:', event);
    }

    return { status: 'success' };
  }
}
