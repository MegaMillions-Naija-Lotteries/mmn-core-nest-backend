import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { desc, eq } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { schema, transactions } from 'src/database/schema';
import { PaystackService } from 'src/paystack/paystack.service';
import { AuthService } from 'src/auth/auth.service';
import SendSMS from 'src/common/helpers/send-sms.helper';

@Injectable()
export class RadioTicketService {
    constructor(
        @Inject('DATABASE') private db: MySql2Database<typeof schema>,
        private paystackService: PaystackService,
        private authService: AuthService
    ) { }

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
            .where(eq(schema.radioStations.id, stationId))
            .limit(1);

        if (!station) {
            throw new NotFoundException('Station not found');
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
                throw new NotFoundException('Draw not found for this station');
            }
            if (draw.status !== 'active' && draw.status !== 'pending') {
                throw new BadRequestException('Draw is not accepting entries');
            }
            if (draw.maxEntries && draw.totalEntries >= draw.maxEntries) {
                throw new BadRequestException('Draw has reached maximum number of entries');
            }
        }

        // Calculate amount (for demo, hardcoded price)
        const ticketPrice = 500;
        const amount = quantity * ticketPrice;

        // Generate a unique reference (use timestamp + userId for demo)
        const reference = `RAD_TCKT_${user.id}_${Date.now()}`;

        console.log(process.env.FRONTEND_HOST)
        const payment = await this.paystackService.initializeTransaction({
            email: user.email,
            amount: amount,
            reference,
            callback_url: `${process.env.FRONTEND_HOST}/radio/verify-payment`,
            // description: `Radio ticket purchase - Station: ${stationId}, Draw: ${drawId || "None"}, Quantity: ${quantity}`
        })

        // get the user's payment method
        // For demo, fetch the first active payment method for the user (customize as needed)
        let [userPaymentMethod] = await this.db
            .select()
            .from(schema.paymentMethods)
            .where(
                eq(schema.paymentMethods.userId, user.id)
            )
            .limit(1);

        if (!userPaymentMethod) {
            // throw new Error('User does not have a payment method configured');
            // create paymentmethod for user
            // For demo, create a default payment method for the user
            const insertedPaymentMethods = await this.db
                .insert(schema.paymentMethods)
                .values({
                    userId: user.id,
                    type: 'virtual',
                    info: `User ${user.id} virtual account`,
                    balance: 0,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    deletedAt: null,
                });

            // Fetch the newly created payment method (assuming auto-increment id)
            const [newPaymentMethod] = await this.db
                .select()
                .from(schema.paymentMethods)
                .where(
                    eq(schema.paymentMethods.userId, user.id)
                )
                .orderBy(schema.paymentMethods.id)
                .limit(1);

            if (!newPaymentMethod) {
                throw new BadRequestException('Failed to create a payment method for the user');
            }
            userPaymentMethod = newPaymentMethod;
        }
        //Todo: use DTO
        const transaction = await this.db.insert(transactions).values({
            type: 'raffle',
            amount: amount,
            status: 'pending',
            idUser: user.id,
            idPaymentMethod: userPaymentMethod.id,
            paymentRef: reference,
            idPaymentMethodConfig: 13,
            date: new Date(),
            description: `Radio ticket purchase - Station: ${stationId}, Draw: ${drawId || "None"}, Quantity: ${quantity}`
        });
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

    async initGuestRadioTicketPurchase(params: {
        phone: string;
        stationId: number;
        drawId?: number;
        quantity: number;
        paymentMethod: string;
    }): Promise<any> {
        const { phone, stationId, drawId, quantity, paymentMethod } = params;

        try {
            // Normalize the phone number
            const normalizedPhone = phone.trim();

            // Validate station exists
            const [station] = await this.db
                .select()
                .from(schema.radioStations)
                .where(eq(schema.radioStations.id, stationId))
                .limit(1);

            if (!station) {
                throw new BadRequestException('Station not found');
            }

            // If drawId is provided, validate it exists and is accepting entries
            let draw: any = undefined;
            if (drawId) {
                [draw] = await this.db
                    .select()
                    .from(schema.radioDraws)
                    .where(eq(schema.radioDraws.id, drawId))
                    .limit(1);

                if (!draw) {
                    throw new BadRequestException('Draw not found for this station');
                }

                if (draw.status !== 'active' && draw.status !== 'scheduled') {
                    throw new BadRequestException('Draw is not accepting entries');
                }

                // Check if draw has reached maximum entries
                if (draw.maxEntries && draw.totalEntries >= draw.maxEntries) {
                    throw new BadRequestException('Draw has reached maximum number of entries');
                }
            }

            // Find or create a user based on the phone number
            let [user] = await this.db
                .select()
                .from(schema.users)
                .where(eq(schema.users.phone, normalizedPhone))
                .limit(1);

            if (!user) {
                // Create a temporary guest user
                const signupResult = await this.authService.signup({
                    email: `${normalizedPhone}@mmn.ng`,
                    phone: normalizedPhone,
                    password: 'password!'
                });

                if (!signupResult) {
                    throw new BadRequestException('Failed to create user');
                }

                // Get the user data from the database
                const [createdUser] = await this.db
                    .select()
                    .from(schema.users)
                    .where(eq(schema.users.email, `${normalizedPhone}@mmn.ng`))
                    .limit(1);

                if (!createdUser) {
                    throw new BadRequestException('Failed to retrieve user data');
                }

                user = createdUser;
            }

            // Calculate the amount
            const ticketPrice = 500; // Base price per ticket in smallest currency unit
            const amount = quantity * ticketPrice;

            // Validate payment method exists
            const [paymentMethodConfig] = await this.db
                .select()
                .from(schema.paymentMethodConfigs)
                .where(eq(schema.paymentMethodConfigs.name, paymentMethod))
                .limit(1);

            if (!paymentMethodConfig) {
                throw new BadRequestException('Invalid payment method');
            }

            // Get or create payment method for user
            let [userPaymentMethod] = await this.db
                .select()
                .from(schema.paymentMethods)
                .where(eq(schema.paymentMethods.userId, user.id))
                .limit(1);

            if (!userPaymentMethod) {
                const insertedPaymentMethods = await this.db
                    .insert(schema.paymentMethods)
                    .values({
                        userId: user.id,
                        type: 'virtual',
                        info: `User ${user.id} virtual account`,
                        balance: 0,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        deletedAt: null,
                    });

                // Fetch the newly created payment method (assuming auto-increment id)
                const [newPaymentMethod] = await this.db
                    .select()
                    .from(schema.paymentMethods)
                    .where(
                        eq(schema.paymentMethods.userId, user.id)
                    )
                    .orderBy(schema.paymentMethods.id)
                    .limit(1);

                if (!newPaymentMethod) {
                    throw new Error('Failed to create a payment method for the user');
                }
                userPaymentMethod = newPaymentMethod;
            }

            // Generate a unique reference
            const reference = `RAD_TCKT_GUEST_${user.id}_${Date.now()}`;

            // Prepare payment data
            const paymentData = {
                email: user.email,
                amount: amount,
                reference,
                callback_url: `${process.env.FRONTEND_HOST}/radio/verify-payment`,
                description: `Radio ticket purchase - Station: ${stationId}, Draw: ${drawId || 'None'}, Quantity: ${quantity}`,
            };

            // Initialize payment based on selected method
            let paymentResult = await this.paystackService.initializeTransaction({
                email: phone + '@mega9ja.com',
                amount: amount,
                reference,
                callback_url: `${process.env.FRONTEND_HOST}/radio/verify-payment`,
                // description: `Radio ticket purchase - Station: ${stationId}, Draw: ${drawId || "None"}, Quantity: ${quantity}`
            });


            // Create transaction record
            await this.db.insert(schema.transactions).values({
                type: 'raffle',
                amount: amount,
                status: 'pending',
                idUser: user.id,
                idPaymentMethod: userPaymentMethod.id,
                paymentRef: reference,
                idPaymentMethodConfig: paymentMethodConfig.id,
                date: new Date(),
                description: `Radio ticket purchase - Station: ${stationId}, Draw: ${drawId || 'None'}, Quantity: ${quantity}`,
            });

            return {
                success: true,
                message: 'Payment initialized successfully',
                data: {
                    reference,
                    paymentData: paymentResult,
                    ticketDetails: {
                        quantity,
                        stationId,
                        drawId: drawId || null,
                        amount,
                        userId: user.id,
                        phone: user.phone,
                    },
                },
            };
        } catch (error) {
            console.error(`Error initializing guest ticket purchase: ${error.message}`, { error });
            throw error;
        }
    }
    /**
 * Verify a radio ticket payment and create tickets if successful.
 * @param reference - Payment reference
 * @param paymentMethod - Payment method used
 * @returns Verification and ticket creation result
 */
    async verifyRadioTicketPayment(reference: string, paymentMethod: string): Promise<any> {
        // In a real implementation, verify with payment gateway and update transaction status
        // verify payment with paystack
        let verification: any;
        console.log(paymentMethod)

        // if (paymentMethod === 'paystack') {
        console.log(paymentMethod)
        verification = await this.paystackService.verifyTransaction(reference);
        console.log(verification)

        // }

        if (!verification || verification.status !== true) {
            return {
                success: false,
                message: 'Payment verification failed with Paystack',
                status: 'failed',
            };
        }
        // update the transaction to success using reference
        await this.db
            .update(transactions)
            .set({
                status: 'success',
                updatedAt: new Date(),
            })
            .where(eq(transactions.paymentRef, reference));
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

        // issue a ticket using all the details esp quantity

        // Extract ticket details from reference or transaction record
        // For demo, parse reference (not secure in real life)
        // Implement radio ticket creation: fetch transaction by reference, extract details, and create radio ticket(s)
        const transaction = await this.db
            .select()
            .from(transactions)
            .where(eq(transactions.paymentRef, reference))
            .limit(1)
            .then(rows => rows[0]);

        if (!transaction) {
            return {
                success: false,
                message: 'Transaction not found for this reference',
                status: 'failed',
            };
        }


        // Extract ticket creation details from the transaction record
        // The transaction object fields are: id, idUser, idManager, idPaymentMethod, amount, status, type, bonusType, ...etc

        // We'll need to know: userId, stationId, drawId, quantity
        // Let's assume the transaction table stores these as metadata fields, or you can reconstruct from the payment context.
        // For this example, let's assume:
        // - idUser: userId
        // - stationId, drawId, quantity are stored in the transaction.info JSON field (common pattern)
        // If not, you may need to adjust this logic to match your schema.

        const ticketDetails = this.extractTicketDetailsFromDescription(transaction.description)
        // Try to parse transaction.info for ticket details
        const userId = transaction.idUser;
        const stationId = ticketDetails.stationId; // must exist as a column
        const drawId = ticketDetails.drawId ?? null; // must exist as a column
        const quantity = ticketDetails.quantity ?? 1; // must exist as a column

        // Validate required fields
        if (userId === null || userId === undefined || typeof userId !== 'number') {
            throw new BadRequestException('Missing or invalid userId for ticket creation');
        }
        if (stationId === null || stationId === undefined || typeof stationId !== 'number') {
            throw new BadRequestException('Missing or invalid stationId for ticket creation');
        }

        // Helper to generate UUID v4
        function generateUuidV4() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }

        const createdTickets: any[] = [];


        for (let i = 0; i < quantity; i++) {
            const ticketUuid = generateUuidV4();
            const ticketData = {
                ticketUuid,
                userId, // must be a number, not null
                stationId, // must be a number, not null
                drawId: drawId ?? null,
                quantity: 1,
                usedCount: 0,
                isActive: true,
                expiresAt: null,
                invalidatedAt: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // Insert ticket into DB
            // Drizzle returns an array of inserted rows (with .insertId if available)
            const [insertResult] = await this.db
                .insert(schema.radioTickets)
                .values(ticketData);

            // If Drizzle returns the inserted row, use its id; otherwise, skip id
            createdTickets.push({
                ticketUuid,
                stationId: ticketData.stationId,
                drawId: ticketData.drawId,
            });
        }

        // get the user phone from the transaction
        const [user] = await this.db
            .select()
            .from(schema.users)
            .where(eq(schema.users.id, userId))
            .limit(1);

        // send an sms and an email to the user
        if (user && user.phone) {
            await SendSMS.sendMessageUpdigital(user.phone,
                `Your radio ticket purchase for ${quantity} tickets has been verified and tickets created successfully`
            );
        }

        return {
            success: true,
            message: 'Payment verified and tickets created successfully',
            data: {
                tickets: createdTickets,
            },
        };
    }
    extractTicketDetailsFromDescription(description: string | null): {
        stationId?: number;
        drawId?: number | null;
        quantity?: number;
    } {
        const ticketDetails: {
            stationId?: number;
            drawId?: number | null;
            quantity?: number;
        } = {};

        try {
            if (!description) {

                return ticketDetails;
            }

            const stationMatch =
                description.match(/Station:\s*(\d+)/i) ||
                description.match(/stationId[:\s]+(\d+)/i) ||
                description.match(/station[:\s]+(\d+)/i);

            const drawMatch =
                description.match(/Draw:\s*(\d+|None)/i) ||
                description.match(/drawId[:\s]+(\d+|None|null)/i) ||
                description.match(/draw[:\s]+(\d+|None|null)/i);

            const quantityMatch =
                description.match(/Quantity:\s*(\d+)/i) ||
                description.match(/quantity[:\s]+(\d+)/i) ||
                description.match(/qty[:\s]+(\d+)/i);
            if (stationMatch?.[1]) {
                ticketDetails.stationId = parseInt(stationMatch[1], 10);
            }

            if (drawMatch?.[1]) {
                const value = drawMatch[1].toLowerCase();
                ticketDetails.drawId = value === 'none' || value === 'null' ? null : parseInt(drawMatch[1], 10);
            } else {
                ticketDetails.drawId = null;
            }

            if (quantityMatch?.[1]) {
                ticketDetails.quantity = parseInt(quantityMatch[1], 10);
            }

            return ticketDetails;
        } catch (e) {
            throw new BadRequestException('Error extracting the description from the transaction')
        }
    }
    generateIdReferral = async (): Promise<number> => {
        let idReferral = 0

        // If you want to get the first result directly (since it returns an array)
        const [lastUser] = await this.db
            .select()
            .from(schema.users)
            .orderBy(desc(schema.users.id))
            .limit(1);
        if (lastUser && typeof lastUser.id === 'number') {
            idReferral = 100888 + lastUser.id + 1
        } else {
            idReferral = 100888 + 1
        }

        return idReferral
    }

}
