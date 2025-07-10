import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { PaystackService } from '../paystack/paystack.service';
import { WebhookGuard } from '../paystack/guards/webhook.guard';
import { InitializeTransactionDto } from '../paystack/dto/initialize-transaction.dto';
import { CreateCustomerDto } from '../paystack/dto/create-customer.dto';

@Controller('payment')
export class PaymentController {
  constructor(private paystackService: PaystackService) {}

  @Post('initialize')
  async initializePayment(@Body() dto: InitializeTransactionDto) {
    return this.paystackService.initializeTransaction(dto);
  }

  @Get('verify/:reference')
  async verifyPayment(@Param('reference') reference: string) {
    return this.paystackService.verifyTransaction(reference);
  }

  @Post('customer')
  async createCustomer(@Body() dto: CreateCustomerDto) {
    return this.paystackService.createCustomer(dto);
  }

  @Get('banks')
  async getBanks() {
    return this.paystackService.listBanks({ country: 'nigeria' });
  }

  @Post('webhook')
  @UseGuards(WebhookGuard)
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
