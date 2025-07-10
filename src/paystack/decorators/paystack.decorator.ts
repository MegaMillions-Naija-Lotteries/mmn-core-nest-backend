import { SetMetadata } from '@nestjs/common';
import { PaystackConfig } from '../interfaces/paystack.interface';

export const PAYSTACK_CONFIG_KEY = 'PAYSTACK_CONFIG';

export const SetPaystackConfig = (config: PaystackConfig) =>
  SetMetadata(PAYSTACK_CONFIG_KEY, config);

// src/paystack/paystack.module.ts

