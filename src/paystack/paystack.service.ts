import { Injectable, Inject, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import {
  PaystackConfig,
  InitializeTransactionDto,
  VerifyTransactionResponse,
  CreateCustomerDto,
  CreateSubaccountDto,
  TransferDto,
} from './interfaces/paystack.interface';

@Injectable()
export class PaystackService {
  private readonly logger = new Logger(PaystackService.name);
  private readonly baseUrl: string;

  constructor(
    @Inject('PAYSTACK_CONFIG') private config: PaystackConfig,
    private httpService: HttpService,
  ) {
    this.baseUrl = config.baseUrl || 'https://api.paystack.co';
  }

  private getHeaders() {
    // Test if your config is working
console.log('Secret Key:', this.config.secretKey);
    return {
      Authorization: `Bearer ${process.env.PAYSTACK_SK_TEST}`,
      // Authorization: `Bearer ${this.config.secretKey}`,
      'Content-Type': 'application/json',
    };
  }

  private async makeRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
  ): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const headers = this.getHeaders();

      let response: AxiosResponse<T>;

      switch (method) {
        case 'GET':
          response = await firstValueFrom(
            this.httpService.get<T>(url, { headers }),
          );
          break;
        case 'POST':
          response = await firstValueFrom(
            this.httpService.post<T>(url, data, { headers }),
          );
          break;
        case 'PUT':
          response = await firstValueFrom(
            this.httpService.put<T>(url, data, { headers }),
          );
          break;
        case 'DELETE':
          response = await firstValueFrom(
            this.httpService.delete<T>(url, { headers }),
          );
          break;
      }

      return response.data;
    } catch (error) {
      this.logger.error(`Paystack API Error: ${error.message}`, error.stack);
      
      if (error.response) {
        throw new HttpException(
          error.response.data?.message || 'Paystack API Error',
          error.response.status || HttpStatus.BAD_REQUEST,
        );
      }
      
      throw new HttpException(
        'Failed to connect to Paystack',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  // Transaction Methods
  async initializeTransaction(dto: InitializeTransactionDto) {
    // Convert amount to kobo (multiply by 100)
    const payload = {
      ...dto,
      amount: dto.amount * 100,
    };

    return this.makeRequest('POST', '/transaction/initialize', payload);
  }

  async verifyTransaction(reference: string): Promise<VerifyTransactionResponse> {
    return this.makeRequest<VerifyTransactionResponse>(
      'GET',
      `/transaction/verify/${reference}`,
    );
  }

  async listTransactions(params?: {
    perPage?: number;
    page?: number;
    customer?: string;
    status?: string;
    from?: string;
    to?: string;
    amount?: number;
  }) {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = `/transaction${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest('GET', endpoint);
  }

  async fetchTransaction(id: number) {
    return this.makeRequest('GET', `/transaction/${id}`);
  }

  async chargeAuthorization(data: {
    authorization_code: string;
    email: string;
    amount: number;
    currency?: string;
    reference?: string;
    metadata?: Record<string, any>;
  }) {
    const payload = {
      ...data,
      amount: data.amount * 100, // Convert to kobo
    };

    return this.makeRequest('POST', '/transaction/charge_authorization', payload);
  }

  // Customer Methods
  async createCustomer(dto: CreateCustomerDto) {
    return this.makeRequest('POST', '/customer', dto);
  }

  async fetchCustomer(emailOrCode: string) {
    return this.makeRequest('GET', `/customer/${emailOrCode}`);
  }

  async listCustomers(params?: {
    perPage?: number;
    page?: number;
    from?: string;
    to?: string;
  }) {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = `/customer${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest('GET', endpoint);
  }

  async updateCustomer(code: string, data: Partial<CreateCustomerDto>) {
    return this.makeRequest('PUT', `/customer/${code}`, data);
  }

  // Subaccount Methods
  async createSubaccount(dto: CreateSubaccountDto) {
    return this.makeRequest('POST', '/subaccount', dto);
  }

  async listSubaccounts(params?: {
    perPage?: number;
    page?: number;
    from?: string;
    to?: string;
  }) {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = `/subaccount${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest('GET', endpoint);
  }

  async fetchSubaccount(idOrCode: string) {
    return this.makeRequest('GET', `/subaccount/${idOrCode}`);
  }

  async updateSubaccount(idOrCode: string, data: Partial<CreateSubaccountDto>) {
    return this.makeRequest('PUT', `/subaccount/${idOrCode}`, data);
  }

  // Plan Methods
  async createPlan(data: {
    name: string;
    interval: 'daily' | 'weekly' | 'monthly' | 'biannually' | 'annually';
    amount: number;
    description?: string;
    send_invoices?: boolean;
    send_sms?: boolean;
    currency?: string;
    invoice_limit?: number;
  }) {
    const payload = {
      ...data,
      amount: data.amount * 100, // Convert to kobo
    };

    return this.makeRequest('POST', '/plan', payload);
  }

  async listPlans(params?: {
    perPage?: number;
    page?: number;
    status?: string;
    interval?: string;
    amount?: number;
  }) {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = `/plan${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest('GET', endpoint);
  }

  async fetchPlan(idOrCode: string) {
    return this.makeRequest('GET', `/plan/${idOrCode}`);
  }

  // Transfer Methods
  async createTransferRecipient(data: {
    type: 'nuban' | 'mobile_money' | 'basa';
    name: string;
    account_number: string;
    bank_code: string;
    currency?: string;
    description?: string;
    metadata?: Record<string, any>;
  }) {
    return this.makeRequest('POST', '/transferrecipient', data);
  }

  async initiateTransfer(dto: TransferDto) {
    const payload = {
      ...dto,
      amount: dto.amount * 100, // Convert to kobo
    };

    return this.makeRequest('POST', '/transfer', payload);
  }

  async listTransfers(params?: {
    perPage?: number;
    page?: number;
    customer?: string;
    from?: string;
    to?: string;
  }) {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = `/transfer${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest('GET', endpoint);
  }

  async fetchTransfer(idOrCode: string) {
    return this.makeRequest('GET', `/transfer/${idOrCode}`);
  }

  async verifyTransfer(reference: string) {
    return this.makeRequest('GET', `/transfer/verify/${reference}`);
  }

  // Utility Methods
  async listBanks(params?: {
    country?: string;
    use_cursor?: boolean;
    perPage?: number;
    page?: number;
  }) {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = `/bank${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest('GET', endpoint);
  }

  async resolveAccountNumber(accountNumber: string, bankCode: string) {
    return this.makeRequest(
      'GET',
      `/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
    );
  }

  async validateCustomer(data: {
    customer_code: string;
    type: 'bank_account' | 'bvn';
    account_number?: string;
    bvn?: string;
    bank_code?: string;
  }) {
    return this.makeRequest('POST', '/customer/validate', data);
  }

  // Webhook signature verification
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const crypto = require('crypto');
    const hash = crypto
      .createHmac('sha512', this.config.secretKey)
      .update(payload)
      .digest('hex');
    return hash === signature;
  }

  // Generate reference
  generateReference(prefix = 'PAY'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `${prefix}_${timestamp}_${random}`;
  }

  // Convert kobo to naira
  koboToNaira(amount: number): number {
    return amount / 100;
  }

  // Convert naira to kobo
  nairaToKobo(amount: number): number {
    return amount * 100;
  }
}
