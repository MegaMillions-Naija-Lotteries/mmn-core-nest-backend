import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PaystackService } from '../paystack.service';

@Injectable()
export class WebhookGuard implements CanActivate {
  constructor(private paystackService: PaystackService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const signature = request.headers['x-paystack-signature'];
    const payload = request.rawBody?.toString('utf-8');

    if (!signature || !payload) {
      throw new UnauthorizedException('Missing webhook signature or payload');
    }

    const isValid = this.paystackService.verifyWebhookSignature(payload, signature);
    
    if (!isValid) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    return true;
  }
}
