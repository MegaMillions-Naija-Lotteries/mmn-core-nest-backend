// app.module.ts
import { Module } from '@nestjs/common';
import { AppModule as AppRootModule } from './app/app.module';

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
import { HttpModule } from '@nestjs/axios';
// import { RadioDrawModule } from './radio-draw/radio-draw.module';
import { RadioModule } from './radio/radio.module';
import { RouterModule } from '@nestjs/core';
import { RadioDrawModule } from './radio-draw/radio-draw.module';
import { TransactionModule } from './transaction/transaction.module';

@Module({
  imports: [
    AppRootModule,
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
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
    RadioModule,
    RouterModule.register([
      {
        path: 'radio',
        module: RadioModule,
      },
    ]),
    RadioDrawModule,
    TransactionModule,
  ],
  controllers: [PaymentController],
  providers: []
})
export class AppModule {}
