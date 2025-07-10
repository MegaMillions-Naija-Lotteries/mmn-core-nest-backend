import { BadRequestException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { and, eq, inArray, Placeholder, sql, SQLWrapper } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { USER_ROLE } from 'src/auth/roles/roles.constant';
import { schema } from 'src/database/schema';

@Injectable()
export class RadioShowSessionService {
    constructor (
        @Inject('DATABASE')
        private db: MySql2Database<typeof schema>
    ) {}
    
    async create(user:{id:number}, createRadioShowSessionDto: {
        showId: number;
    }) {
        // check if the user and the show share a similar station if not throw a forbidden error
        // 1. Get the show and its stationId
        const [show] = await this.db
            .select({
                id: schema.radioShows.id,
                stationId: schema.radioShows.stationId,
            })
            .from(schema.radioShows)
            .where(eq(schema.radioShows.id, createRadioShowSessionDto.showId))
            .limit(1);

        if (!show) {
            throw new BadRequestException('Radio show not found');
        }

        // 2. Get the user's stationIds (from stationUsers table)
        const userStations = await this.db
            .select({
                stationId: schema.stationUsers.stationId,
            })
            .from(schema.stationUsers)
            .where(eq(schema.stationUsers.userId, user.id));

        const userStationIds = userStations.map(us => us.stationId);

        if (!userStationIds.includes(show.stationId)) {
            throw new BadRequestException('User does not belong to the same station as the show');
        }
        // Check if there's already an active session for this show
        const [activeSession] = await this.db
            .select()
            .from(schema.radioShowSessions)
            .where(
                and(
                    eq(schema.radioShowSessions.showId, createRadioShowSessionDto.showId),
                    eq(schema.radioShowSessions.status, 'active')
                )
            )
            .limit(1);

        if (activeSession) {
            throw new BadRequestException(
                'There is already an active session for this show'
            );
        }
        // Add the stationId from the show to the insert values
        const stationId = show.stationId;
        // Insert the new session
        const result = await this.db
            .insert(schema.radioShowSessions)
            .values({
                showId: createRadioShowSessionDto.showId,
                userId: user.id,
                startTime: new Date(),
                endTime: null,
                status: 'active',
                sessionDate: new Date(),
                stationId
            });

        // Get the inserted session (assuming insertId is available)
        const insertId = result[0]?.insertId;
        if (!insertId) {
            throw new InternalServerErrorException(
                'Failed to create radio show session'
            );
        }

        const [session] = await this.db
            .select()
            .from(schema.radioShowSessions)
            .where(eq(schema.radioShowSessions.id, insertId))
            .limit(1);

        return session;
    }
    async getAll(
        user: { role: number;id:number },
        filters: {
            page?: number;
            limit?: number;
            showId?: number;
            status?: 'active' | 'ended' | 'paused';
            sessionDate?: string;
        }
    ) {
        // Destructure and set defaults
        const {
            page = 1,
            limit = 20,
            showId,
            status,
            sessionDate,
        } = filters;

        // Build where conditions
        const whereClauses: any[] = [];
        if (showId) {
            // Assuming schema.radioShowSessions.showId exists
            whereClauses.push(eq(schema.radioShowSessions.showId, showId));
        }
        if (status) {
            // Assuming schema.radioShowSessions.status exists
            whereClauses.push(eq(schema.radioShowSessions.status, status));
        }
        if (sessionDate) {
            // Convert sessionDate string to Date object for comparison
            const dateObj = new Date(sessionDate);
            if (!isNaN(dateObj.getTime())) {
                whereClauses.push(eq(schema.radioShowSessions.sessionDate, dateObj));
            }
        }
        // Optionally, filter by userId if sessions are user-specific
        // Only restrict to userId if NOT admin or station
        if (user.role !== USER_ROLE.ROLE_ADMIN && user.role !== USER_ROLE.ROLE_STATION) {
            whereClauses.push(eq(schema.radioShowSessions.userId, user.id));
        }
        
        // Pagination
        const offset = (page - 1) * limit;

        // Query
        const query = this.db
            .select()
            .from(schema.radioShowSessions)
            .limit(limit)
            .offset(offset);

        if (whereClauses.length > 0) {
            query.where(and(...whereClauses));
        }

        const results = await query;

        // Optionally, get total count for pagination
        const [{ count }] = await this.db
            .select({ count: sql<number>`count(*)` })
            .from(schema.radioShowSessions)
            .where(whereClauses.length > 0 ? and(...whereClauses) : undefined);

        return {
            data: results,
            total: count, // Replace with actual count if needed
            page,
            limit,
        };
    }
    // Get a single radio show session by ID
    async getById(id: number) {
        // Fetch the radio show session by its ID
        const [session] = await this.db
            .select()
            .from(schema.radioShowSessions)
            .where(eq(schema.radioShowSessions.id, id))
            .limit(1);

        if (!session) {
            return null;
        }
        return session;
    }
    // Update a radio show session by ID
    async updateById(id: number, updateDto: any) {
        // Remove fields that should not be updated (e.g., id, userId, showId, createdAt)
        const { id: _id, userId: _userId, showId: _showId, createdAt: _createdAt, ...updateFields } = updateDto || {};

        if (Object.keys(updateFields).length === 0) {
            throw new Error('No valid fields to update');
        }

        // Set updatedAt to now
        updateFields.updatedAt = new Date();

        // Perform the update
        const result = await this.db
            .update(schema.radioShowSessions)
            .set(updateFields)
            .where(eq(schema.radioShowSessions.id, id));

        // Optionally, return the updated record
        return this.getById(id);
    }
    // Delete a radio show session by ID
    async deleteById(id: number) {
        // Optionally, check if the session exists first
        const [session] = await this.db
            .select()
            .from(schema.radioShowSessions)
            .where(eq(schema.radioShowSessions.id, id))
            .limit(1);

        if (!session) {
            throw new Error('Radio show session not found');
        }

        // Perform the delete
        await this.db
            .delete(schema.radioShowSessions)
            .where(eq(schema.radioShowSessions.id, id));

        return { success: true };
    }
    // Get all draws for a radio show session
    async getSessionDraws(user: any, sessionId: number) {

        const draws = await this.db
            .select()
            .from(schema.radioDraws)
            .where(eq(schema.radioDraws.sessionId, sessionId));

        return draws;
    }
}