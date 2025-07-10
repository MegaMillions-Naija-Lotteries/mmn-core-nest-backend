import { IsEmail, IsNumber, IsOptional, IsString, IsArray, IsObject, Min } from 'class-validator';

export class InitializeTransactionDto {
  @IsEmail()
  email: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string = 'NGN';

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  callback_url?: string;

  @IsOptional()
  @IsString()
  plan?: string;

  @IsOptional()
  @IsNumber()
  invoice_limit?: number;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  channels?: string[];

  @IsOptional()
  @IsString()
  split_code?: string;

  @IsOptional()
  @IsString()
  subaccount?: string;

  @IsOptional()
  @IsNumber()
  transaction_charge?: number;

  @IsOptional()
  @IsString()
  bearer?: string;
}
