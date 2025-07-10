// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Feature modules
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RadioStationModule } from './radio-station/radio-station.module';
import { DatabaseModule } from './database/database.module';
import { RadioShowModule } from './radio-show/radio-show.module';
import { RadioShowSessionModule } from './radio-show-session/radio-show-session.module';
import { RadioTicketModule } from './radio-ticket/radio-ticket.module';
import { PaystackModule } from './paystack/paystack.module';
import { PaymentController } from './payment/payment.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PaystackModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        secretKey: configService.get<string>('PAYSTACK_SECRET_KEY') || '',
        publicKey: configService.get<string>('PAYSTACK_PUBLIC_KEY') || '',
      }),
      inject: [ConfigService],
    }),
    DatabaseModule,
    AuthModule,
    UserModule,
    RadioStationModule,
    RadioShowModule,
    RadioShowSessionModule,
    RadioTicketModule,
  ],
  controllers:[PaymentController]
  
})
export class AppModule {}
