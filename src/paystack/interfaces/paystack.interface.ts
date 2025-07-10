// src/paystack/interfaces/paystack.interface.ts
export interface PaystackConfig {
    secretKey: string;
    publicKey: string;
    baseUrl?: string;
  }
  
  export interface InitializeTransactionDto {
    email: string;
    amount: number;
    currency?: string;
    reference?: string;
    callback_url?: string;
    plan?: string;
    invoice_limit?: number;
    metadata?: Record<string, any>;
    channels?: string[];
    split_code?: string;
    subaccount?: string;
    transaction_charge?: number;
    bearer?: string;
  }
  
  export interface VerifyTransactionResponse {
    status: boolean;
    message: string;
    data: {
      id: number;
      domain: string;
      status: string;
      reference: string;
      amount: number;
      message: string;
      gateway_response: string;
      paid_at: string;
      created_at: string;
      channel: string;
      currency: string;
      ip_address: string;
      metadata: Record<string, any>;
      fees: number;
      customer: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
        metadata: Record<string, any>;
      };
      authorization: {
        authorization_code: string;
        bin: string;
        last4: string;
        exp_month: string;
        exp_year: string;
        channel: string;
        card_type: string;
        bank: string;
        country_code: string;
        brand: string;
        reusable: boolean;
        signature: string;
      };
    };
  }
  
  export interface CreateCustomerDto {
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    metadata?: Record<string, any>;
  }
  
  export interface CreateSubaccountDto {
    business_name: string;
    settlement_bank: string;
    account_number: string;
    percentage_charge: number;
    description?: string;
    primary_contact_email?: string;
    primary_contact_name?: string;
    primary_contact_phone?: string;
    metadata?: Record<string, any>;
  }
  
  export interface TransferDto {
    source: string;
    amount: number;
    recipient: string;
    reason?: string;
    currency?: string;
    reference?: string;
  }