import { Module, DynamicModule, Global } from '@nestjs/common';
import { PaystackService } from './paystack.service';
import { PaystackConfig } from './interfaces/paystack.interface';
import { HttpModule } from '@nestjs/axios';

@Global()
@Module({
    imports:[HttpModule],
    exports:[PaystackService],
    providers:[PaystackService]
})
export class PaystackModule {
  static forRoot(config: PaystackConfig): DynamicModule {
    return {
      module: PaystackModule,
      providers: [
        {
          provide: 'PAYSTACK_CONFIG',
          useValue: config,
        },
        PaystackService,
      ],
      exports: [PaystackService],
    };
  }

  static forRootAsync(options: {
    useFactory: (...args: any[]) => Promise<PaystackConfig> | PaystackConfig;
    inject?: any[];
  }): DynamicModule {
    return {
      module: PaystackModule,
      providers: [
        {
          provide: 'PAYSTACK_CONFIG',
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        PaystackService,
      ],
      exports: [PaystackService],
    };
  }
}