import { Injectable, Inject } from '@nestjs/common';
import { and, eq, gte, like, lt, sql } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { schema } from 'src/database/schema';

@Injectable()
export class TransactionService {
    constructor(@Inject('DATABASE') private db: MySql2Database<typeof schema>) {}
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
        // if (filters.stationId) {
        //     whereClauses.push(
        //         eq(
        //             sql`CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(${schema.transactions.description}, 'Station: ', -1), ',', 1) AS UNSIGNED)`,
        //             filters.stationId,
        //         ),
        //     );
        // }

        // if (filters.drawId) {
        //     whereClauses.push(
        //         eq(
        //             sql`CAST(NULLIF(SUBSTRING_INDEX(SUBSTRING_INDEX(${schema.transactions.description}, 'Draw: ', -1), ',', 1), 'None') AS UNSIGNED)`,
        //             filters.drawId,
        //         ),
        //     );
        // }

        // if (filters.quantity) {
        //     whereClauses.push(
        //         eq(
        //             sql`CAST(SUBSTRING_INDEX(${schema.transactions.description}, 'Quantity: ', -1) AS UNSIGNED)`,
        //             filters.quantity,
        //         ),
        //     );
        // }
        // if (filters.startDate) {
        //     whereClauses.push(
        //         and(
        //             eq(schema.transactions.type, 'Radio ticket purchase'),
        //             gte(schema.transactions.createdAt, new Date(filters.startDate)),
        //         ),
        //     );
        // }
        // if (filters.endDate) {
        //     whereClauses.push(
        //         and(
        //             eq(schema.transactions.type, 'Radio ticket purchase'),
        //             lt(schema.transactions.createdAt, new Date(filters.endDate)),
        //         ),
        //     );
        // }
        console.log(whereClauses);

        // const query = this.db
        //     .select()
        //     .from(schema.transactions)
        //     .where(and(...whereClauses));

        // if (filters.page && filters.limit) {
        //     query.limit(filters.limit).offset((filters.page - 1) * filters.limit);
        // }
        // return query;
        return await this.db
            .select()
            .from(schema.transactions)
            .limit(10);
    }
    async getTransactionByStation(stationId?: number): Promise<any> {
        if (stationId) {
            const [station] = await this.db
                .select()
                .from(schema.radioStations)
                .where(eq(schema.radioStations.id, stationId))
                .limit(1);

            const transactions = await this.searchRadioTicketTransactions(stationId);

            return {
                ...station,
                transactions
            };
        }

        const transactions = await this.searchRadioTicketTransactions();

        const transactionsWithStations = await Promise.all(
            transactions.map(async transaction => {
                const [station] = await this.db
                    .select()
                    .from(schema.radioStations)
                    .where(eq(schema.radioStations.id, this.parseTransactionDescription(transaction.description ?? '').stationId ? Number(this.parseTransactionDescription(transaction.description ?? '').stationId) : 0))
                    .limit(1);

                return {
                    ...transaction,
                    station
                };
            })
        );

        return transactionsWithStations;
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
