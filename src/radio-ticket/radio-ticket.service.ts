import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { schema } from 'src/database/schema';
import { PaystackService } from 'src/paystack/paystack.service';

@Injectable()
export class RadioTicketService {
    constructor(
        @Inject('DATABASE') private db: MySql2Database<typeof schema>,
        private paystackService: PaystackService
    ) {}

    /**
     * Initialize a radio ticket purchase for a user.
     * @param params - { stationId, drawId, quantity, paymentMethod, user }
     * @returns Payment initialization result
     */
    async initRadioTicketPurchase(params: {
        stationId: number;
        drawId?: number;
        quantity: number;
        paymentMethod: string;
        user: any;
    }): Promise<any> {
        // NOTE: This is a simplified, NestJS-adapted version.
        // You should implement actual payment gateway logic and transaction handling as needed.
        const { stationId, drawId, quantity, paymentMethod, user } = params;

        // Validate input
        if (!stationId || !quantity || !paymentMethod || !user?.id) {
            throw new BadRequestException('Missing required parameters');
        }

        // Validate station exists
        const [station] = await this.db
            .select()
            .from(schema.radioStations)
            .where(eq(schema.radioStations.id,  stationId))
            .limit(1);

        if (!station) {
            throw new Error('Station not found');
        }

        // Validate draw if provided
        let draw: any = undefined;
        if (drawId) {
            [draw] = await this.db
                .select()
                .from(schema.radioDraws)
                .where(eq(schema.radioDraws.id, drawId))
                .limit(1);

            if (!draw) {
                throw new Error('Draw not found for this station');
            }
            if (draw.status !== 'active' && draw.status !== 'pending') {
                throw new Error('Draw is not accepting entries');
            }
            if (draw.maxEntries && draw.totalEntries >= draw.maxEntries) {
                throw new Error('Draw has reached maximum number of entries');
            }
        }

        // Calculate amount (for demo, hardcoded price)
        const ticketPrice = 100;
        const amount = quantity * ticketPrice;

        // Generate a unique reference (use timestamp + userId for demo)
        const reference = `RAD_TCKT_${user.id}_${Date.now()}`;

        // Here you would call your payment gateway service to initialize payment
        // For demo, we just return a mock payment result
        // const paymentResult = {
        //     status: true,
        //     success: true,
        //     paymentUrl: 'https://mock-payment-gateway.com/pay/' + reference,
        //     reference,
        // };
        const payment = await this.paystackService.initializeTransaction({
            email: user.email,
            amount: quantity * 500,
            reference
        })

        // const verification = await this.paystackService.verifyTransaction(reference);
        // Optionally, create a pending transaction record in your DB here

        return {
            success: true,
            message: 'Payment initialized successfully',
            data: {
                reference,
                paymentData: payment,
                ticketDetails: {
                    quantity,
                    stationId,
                    drawId: drawId || null,
                    amount,
                },
            },
        };
    }

    /**
     * Verify a radio ticket payment and create tickets if successful.
     * @param reference - Payment reference
     * @param paymentMethod - Payment method used
     * @returns Verification and ticket creation result
     */
    async verifyRadioTicketPayment(reference: string, paymentMethod: string): Promise<any> {
        // In a real implementation, verify with payment gateway and update transaction status
        // For demo, assume payment is successful if reference exists

        // Find the pending transaction (mocked)
        // In real code, query your transaction table
        // For demo, just simulate success
        const transactionStatus = 'success';

        if (transactionStatus !== 'success') {
            return {
                success: false,
                message: 'Payment verification failed',
                status: 'failed',
            };
        }

        // Extract ticket details from reference or transaction record
        // For demo, parse reference (not secure in real life)
        const match = reference.match(/^RAD_TCKT_(\d+)_(\d+)$/);
        if (!match) {
            return {
                success: false,
                message: 'Invalid reference',
                status: 'failed',
            };
        }
        const userId = parseInt(match[1], 10);

        // For demo, create tickets (in real code, get details from transaction)
        const createdTickets = [
            {
                id: 1,
                ticketUuid: 'demo-uuid-1',
                stationId: 1,
                drawId: null,
            },
        ];

        return {
            success: true,
            message: 'Payment verified and tickets created successfully',
            data: {
                tickets: createdTickets,
            },
        };
    }
}
