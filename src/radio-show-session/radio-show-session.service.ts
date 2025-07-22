import { BadRequestException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { and, asc, eq, inArray, Placeholder, sql, SQLWrapper } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { USER_ROLE } from 'src/auth/roles/roles.constant';
import { schema } from 'src/database/schema';
import { SelectRadioShowSession } from 'src/database/radio-show-session.entity';
import { RadioShowSessionResponse } from './radio-show-session.dto';

@Injectable()
export class RadioShowSessionService {
    constructor (
        @Inject('DATABASE')
        private db: MySql2Database<typeof schema>
    ) {}
    
    async create(createRadioShowSessionDto: {
        showId: number;
        userId: number;
    }) {
        // get the user using the user id
        // if they exist continue if not throw an error
        const [user] = await this.db
            .select()
            .from(schema.users)
            .where(eq(schema.users.id, createRadioShowSessionDto.userId))
            .limit(1);
        if (!user) {
            throw new BadRequestException('User not found');
        }
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
        // if (user.role !== USER_ROLE.ROLE_ADMIN && user.role !== USER_ROLE.ROLE_STATION) {
        //     whereClauses.push(eq(schema.radioShowSessions.userId, user.id));
        // }
        
        // Pagination
        const offset = (page - 1) * limit;

        // Query
        const query = this.db
            .select({
                session: schema.radioShowSessions,
                show: schema.radioShows,
                station: schema.radioStations,
                totalDraws: sql<number>`(
                    SELECT COUNT(*)
                    FROM ${schema.radioDraws}
                    WHERE ${schema.radioDraws}.sessionId = ${schema.radioShowSessions}.id
                )`,
                totalWinners: sql<number>`(
                    SELECT COUNT(*)
                    FROM ${schema.radioDraws}
                    WHERE ${schema.radioDraws}.sessionId = ${schema.radioShowSessions}.id
                    AND ${schema.radioDraws}.winner IS NOT NULL
                )`,
            })
            .from(schema.radioShowSessions)
            .innerJoin(schema.radioShows, eq(schema.radioShows.id, schema.radioShowSessions.showId))
            .innerJoin(schema.radioStations, eq(schema.radioStations.id, schema.radioShowSessions.stationId))
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
            data: results.map((session) => ({
                ...session.session,
                show: session.show,
                station: session.station,
                totalDraws: session.totalDraws,
                totalWinners: session.totalWinners,
            })),
            total: count, // Replace with actual count if needed
            page,
            limit,
        };
    }
    // Get a single radio show session by ID
    async getById(id: number): Promise<RadioShowSessionResponse | null> {
        // Fetch the radio show session by its ID
        const [session] = await this.db
            .select()
            .from(schema.radioShowSessions)
            .where(eq(schema.radioShowSessions.id, id))
            .limit(1);

        if (!session) {
            return null;
        }

        const draws = await this.db
            .select()
            .from(schema.radioDraws)
            .where(eq(schema.radioDraws.sessionId, id))
            .orderBy(asc(schema.radioDraws.drawNumber));

        const show = await this.db
            .select()
            .from(schema.radioShows)
            .where(eq(schema.radioShows.id, session.showId))
            .limit(1);

        const stats = await this.db
            .select({
                total_draws: sql<number>`count(*)`,
                completed_draws: sql<number>`count(case when ${eq(schema.radioDraws.status, 'completed')} then 1 end)`,
                pending_draws: sql<number>`count(case when ${eq(schema.radioDraws.status, 'pending')} then 1 end)`,
                active_draws: sql<number>`count(case when ${eq(schema.radioDraws.status, 'active')} then 1 end)`,
                total_winners: sql<number>`count(case when ${schema.radioDraws.winningTicketId} is not null then 1 end)`,
                totalEntries: sql<number>`sum(${schema.radioDraws.totalEntries})`,
            })
            .from(schema.radioDraws)
            .where(eq(schema.radioDraws.sessionId, id));

        if (!session) return null;

        return {
            session,
            draws,
            show: show[0],
            stats: stats[0],
            userId: session.userId,
            status: session.status,
        };
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