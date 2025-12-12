import { Injectable, Inject } from '@nestjs/common';
import { and, eq, gte, like, lt, sql } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { schema } from 'src/database/schema';

@Injectable()
export class TransactionService {
    constructor(@Inject('DATABASE') private db: MySql2Database<typeof schema>) { }
    // async getAllRadioTransactions(filters: {
    //     stationId?: number;
    //     drawId?: number;
    //     quantity?: number;
    //     page?: number;
    //     limit?: number;
    //     startDate?: string;
    //     endDate?: string;
    // } = {}) {
    //     const whereClauses: any[] = [];
    //     whereClauses.push(eq(schema.transactions.type, 'raffle'));
    //     if (filters.stationId) {
    //         whereClauses.push(
    //             eq(
    //                 sql`CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(${schema.transactions.description}, 'Station: ', -1), ',', 1) AS UNSIGNED)`,
    //                 filters.stationId,
    //             ),
    //         );
    //     }

    //     if (filters.drawId) {
    //         whereClauses.push(
    //             eq(
    //                 sql`CAST(NULLIF(SUBSTRING_INDEX(SUBSTRING_INDEX(${schema.transactions.description}, 'Draw: ', -1), ',', 1), 'None') AS UNSIGNED)`,
    //                 filters.drawId,
    //             ),
    //         );
    //     }

    //     if (filters.quantity) {
    //         whereClauses.push(
    //             eq(
    //                 sql`CAST(SUBSTRING_INDEX(${schema.transactions.description}, 'Quantity: ', -1) AS UNSIGNED)`,
    //                 filters.quantity,
    //             ),
    //         );
    //     }
    //     if (filters.startDate) {
    //         whereClauses.push(
    //             and(
    //                 eq(schema.transactions.type, 'Radio ticket purchase'),
    //                 gte(schema.transactions.createdAt, new Date(filters.startDate)),
    //             ),
    //         );
    //     }
    //     if (filters.endDate) {
    //         whereClauses.push(
    //             and(
    //                 eq(schema.transactions.type, 'Radio ticket purchase'),
    //                 lt(schema.transactions.createdAt, new Date(filters.endDate)),
    //             ),
    //         );
    //     }
    //     let offset = 0;
    //     let limit = Number(filters.limit) ?? 10; // Default limit

    //     if (filters.page) {
    //         offset = (filters.page - 1) * limit;
    //     }

    //     const query = this.db
    //         .select()
    //         .from(schema.transactions)
    //         .where(and(...whereClauses))
    //         .limit(limit)
    //         .offset(offset);

    //     const results = await query;

    //     // Parse descriptions and add to payload
    //     const resultsWithParsedData = results.map(transaction => {
    //         try {
    //             const parsed = this.parseTransactionDescription(transaction.description ?? '');
    //             return {
    //                 ...transaction,
    //                 stationId: parsed.stationId,
    //                 drawId: parsed.drawId,
    //                 quantity: parsed.quantity
    //             };
    //         } catch (error) {
    //             // If parsing fails, return transaction without parsed data
    //             console.log(error.message)
    //             return transaction;
    //         }
    //     });

    //     return resultsWithParsedData;
    // }
    async getAllRadioTransactions(filters: {
        stationId?: number;
        drawId?: number;
        quantity?: number;
        page?: number;
        limit?: number;
        startDate?: string;
        endDate?: string;
    } = {}) {
        const whereClauses: any[] = [];
        whereClauses.push(eq(schema.transactions.type, 'raffle'));

        if (filters.stationId) {
            whereClauses.push(
                eq(
                    sql`CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(${schema.transactions.description}, 'Station: ', -1), ',', 1) AS UNSIGNED)`,
                    filters.stationId,
                ),
            );
        }

        if (filters.drawId) {
            whereClauses.push(
                eq(
                    sql`CAST(NULLIF(SUBSTRING_INDEX(SUBSTRING_INDEX(${schema.transactions.description}, 'Draw: ', -1), ',', 1), 'None') AS UNSIGNED)`,
                    filters.drawId,
                ),
            );
        }

        if (filters.quantity) {
            whereClauses.push(
                eq(
                    sql`CAST(SUBSTRING_INDEX(${schema.transactions.description}, 'Quantity: ', -1) AS UNSIGNED)`,
                    filters.quantity,
                ),
            );
        }

        if (filters.startDate) {
            whereClauses.push(
                gte(schema.transactions.createdAt, new Date(filters.startDate)),
            );
        }

        if (filters.endDate) {
            whereClauses.push(
                lt(schema.transactions.createdAt, new Date(filters.endDate)),
            );
        }

        const limit = Number(filters.limit) || 10; // Use || instead of ??
        const offset = filters.page ? (filters.page - 1) * limit : 0;

        const query = this.db
            .select()
            .from(schema.transactions)
            .where(and(...whereClauses))
            .limit(limit)
            .offset(offset);

        const results = await query;

        // Parse descriptions and add to payload
        const resultsWithParsedData = await Promise.all(results.map(async transaction => {
            try {
                const parsed = this.parseTransactionDescription(transaction.description ?? '');

                // Fetch station name
                const [station] = await this.db
                    .select()
                    .from(schema.radioStations)
                    .where(eq(schema.radioStations.id, parsed.stationId))
                    .limit(1);

                // Fetch user phone and country code
                const [user] = await this.db
                    .select({
                        phone: schema.users.phone,
                        countryCode: schema.users.countryCode
                    })
                    .from(schema.users)
                    .where(eq(schema.users.id, transaction.idUser ?? 0))
                    .limit(1);
                const userPhoneCountryCode = user?.countryCode ?? '';
                const userPhone = user?.phone ?? '';
                return {
                    ...transaction,
                    stationId: parsed.stationId,
                    drawId: parsed.drawId,
                    quantity: parsed.quantity,
                    stationName: station?.name ?? null,
                    phone: userPhoneCountryCode + userPhone,
                };
            } catch (error) {
                console.log(error.message);
                return transaction;
            }
        }));

        return resultsWithParsedData;
    }
    // async getTransactionByStation(stationId?: number, filter?: {
    //     drawId?: number;
    //     quantity?: number;
    //     page?: number;
    //     limit?: number;
    //     startDate?: string;
    //     endDate?: string;
    // }): Promise<any> {
    //     const whereClauses: any[] = [];
    //     if (filter?.drawId) {
    //         whereClauses.push(
    //             eq(
    //                 sql`CAST(NULLIF(SUBSTRING_INDEX(SUBSTRING_INDEX(${schema.transactions.description}, 'Draw: ', -1), ',', 1), 'None') AS UNSIGNED)`,
    //                 filter.drawId,
    //             ),
    //         );
    //     }
    //     if (filter?.quantity) {
    //         whereClauses.push(
    //             eq(
    //                 sql`CAST(SUBSTRING_INDEX(${schema.transactions.description}, 'Quantity: ', -1) AS UNSIGNED)`,
    //                 filter.quantity,
    //             ),
    //         );
    //     }
    //     if (filter?.startDate) {
    //         whereClauses.push(
    //             and(
    //                 eq(schema.transactions.type, 'Radio ticket purchase'),
    //                 gte(schema.transactions.createdAt, new Date(filter.startDate)),
    //             ),
    //         );
    //     }
    //     if (filter?.endDate) {
    //         whereClauses.push(
    //             and(
    //                 eq(schema.transactions.type, 'Radio ticket purchase'),
    //                 lt(schema.transactions.createdAt, new Date(filter.endDate)),
    //             ),
    //         );
    //     }
    //     if (stationId) {
    //         const [station] = await this.db
    //             .select()
    //             .from(schema.radioStations)
    //             .where(eq(schema.radioStations.id, stationId))
    //             .limit(1);

    //         const transactions = await this.searchRadioTicketTransactions(stationId);

    //         // Parse descriptions and add to payload
    //         const transactionsWithParsedData = transactions.map(transaction => {
    //             try {
    //                 const parsed = this.parseTransactionDescription(transaction.description ?? '');
    //                 return {
    //                     ...transaction,
    //                     stationId: parsed.stationId,
    //                     drawId: parsed.drawId,
    //                     quantity: parsed.quantity
    //                 };
    //             } catch (error) {
    //                 // If parsing fails, return transaction without parsed data
    //                 return transaction;
    //             }
    //         });

    //         return {
    //             ...station,
    //             transactions: transactionsWithParsedData
    //         };
    //     }

    //     const transactions = await this.searchRadioTicketTransactions();

    //     const transactionsWithStations = await Promise.all(
    //         transactions.map(async transaction => {
    //             let parsed;
    //             try {
    //                 parsed = this.parseTransactionDescription(transaction.description ?? '');
    //             } catch (error) {
    //                 // If parsing fails, use default values
    //                 parsed = { stationId: 0, drawId: null, quantity: 0 };
    //             }

    //             const [station] = await this.db
    //                 .select()
    //                 .from(schema.radioStations)
    //                 .where(eq(schema.radioStations.id, parsed.stationId || 0))
    //                 .limit(1);

    //             return {
    //                 ...transaction,
    //                 stationId: parsed.stationId,
    //                 drawId: parsed.drawId,
    //                 quantity: parsed.quantity,
    //                 station
    //             };
    //         })
    //     );

    //     return transactionsWithStations;
    // }
    async getTransactionByStation(stationId?: number, filter?: {
        drawId?: number;
        quantity?: number;
        page?: number;
        limit?: number;
        startDate?: string;
        endDate?: string;
    }): Promise<any> {
        const whereClauses: any[] = [];
        whereClauses.push(eq(schema.transactions.type, 'Radio ticket purchase'));

        if (filter?.drawId) {
            whereClauses.push(
                eq(
                    sql`CAST(NULLIF(SUBSTRING_INDEX(SUBSTRING_INDEX(${schema.transactions.description}, 'Draw: ', -1), ',', 1), 'None') AS UNSIGNED)`,
                    filter.drawId,
                ),
            );
        }

        if (filter?.quantity) {
            whereClauses.push(
                eq(
                    sql`CAST(SUBSTRING_INDEX(${schema.transactions.description}, 'Quantity: ', -1) AS UNSIGNED)`,
                    filter.quantity,
                ),
            );
        }

        if (filter?.startDate) {
            whereClauses.push(
                gte(schema.transactions.createdAt, new Date(filter.startDate)),
            );
        }

        if (filter?.endDate) {
            whereClauses.push(
                lt(schema.transactions.createdAt, new Date(filter.endDate)),
            );
        }

        if (stationId) {
            whereClauses.push(
                eq(
                    sql`CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(${schema.transactions.description}, 'Station: ', -1), ',', 1) AS UNSIGNED)`,
                    stationId,
                ),
            );
        }

        // Apply pagination
        const limit = Number(filter?.limit) || 10;
        const offset = filter?.page ? (filter.page - 1) * limit : 0;

        // Fetch transactions with filters
        const transactions = await this.db
            .select()
            .from(schema.transactions)
            .where(and(...whereClauses))
            .limit(limit)
            .offset(offset);

        // Parse descriptions and fetch related data
        const transactionsWithParsedData = await Promise.all(transactions.map(async transaction => {
            try {
                const parsed = this.parseTransactionDescription(transaction.description ?? '');

                // Fetch station name
                const [station] = await this.db
                    .select()
                    .from(schema.radioStations)
                    .where(eq(schema.radioStations.id, parsed.stationId))
                    .limit(1);

                // Fetch user phone and country code
                const [user] = await this.db
                    .select({
                        phone: schema.users.phone,
                        countryCode: schema.users.countryCode
                    })
                    .from(schema.users)
                    .where(eq(schema.users.id, transaction.idUser ?? 0))
                    .limit(1);

                const userPhoneCountryCode = user?.countryCode ?? '';
                const userPhone = user?.phone ?? '';

                return {
                    ...transaction,
                    stationId: parsed.stationId,
                    drawId: parsed.drawId,
                    quantity: parsed.quantity,
                    stationName: station?.name ?? null,
                    phone: userPhoneCountryCode + userPhone,
                };
            } catch (error) {
                console.log(error.message);
                return {
                    ...transaction,
                    stationId: 0,
                    drawId: null,
                    quantity: 0,
                    stationName: null,
                    phone: ''
                };
            }
        }));

        // If specific station requested, fetch station info and group
        if (stationId) {
            const [station] = await this.db
                .select()
                .from(schema.radioStations)
                .where(eq(schema.radioStations.id, stationId))
                .limit(1);

            return {
                ...station,
                transactions: transactionsWithParsedData
            };
        }

        return transactionsWithParsedData;
    }

    /**const { stationId, drawId, quantity } = this.parseTransactionDescription(description);
     * Parse a transaction description into its components
     * @param description The transaction description string
     * @returns An object containing stationId, drawId, and quantity
     */
    parseTransactionDescription(description: string): {
        stationId: number;
        drawId: number | null;
        quantity: number;
    } {
        const pattern = /Radio ticket purchase - Station: (\d+), Draw: (\w+), Quantity: (\d+)/;
        const match = description.match(pattern);

        if (!match) {
            throw new Error('Invalid transaction description format');
        }

        const stationId = parseInt(match[1], 10);
        const drawId = match[2] === 'None' ? null : parseInt(match[2] ?? '', 10);
        const quantity = parseInt(match[3], 10);

        return {
            stationId,
            drawId,
            quantity,
        };
    }

    /**
     * Search for transactions with a specific pattern in description
     * @param stationId Optional station ID to filter by
     * @param drawId Optional draw ID to filter by
     * @param quantity Optional quantity to filter by
     * @returns Array of matching transactions
     */
    async searchRadioTicketTransactions(
        stationId?: number,
        drawId?: number | null,
        quantity?: number
    ) {
        // Build the pattern based on provided filters
        let pattern = 'Radio ticket purchase - Station: ';
        if (stationId !== undefined) {
            pattern += stationId;
        }
        pattern += ', Draw: ';
        if (drawId !== undefined) {
            pattern += drawId;
        } else {
            pattern += 'None';
        }
        pattern += ', Quantity: ';
        if (quantity !== undefined) {
            pattern += quantity;
        }

        // Add wildcards for partial matches
        pattern = `%${pattern}%`;

        return this.db
            .select()
            .from(schema.transactions)
            .where(like(schema.transactions.description, pattern));
    }
}
