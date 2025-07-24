import { Inject, Injectable } from '@nestjs/common';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { schema } from '../database/schema';
import { CreateRadioShowDto } from './dto/create-radio-show.dto';
import { radioShows, SelectRadioShow } from 'src/database/radio-show.entity';
import { and, eq, inArray, like } from 'drizzle-orm';
import { USER_ROLE } from 'src/auth/roles/roles.constant';
import { UpdateRadioShowDto } from './dto/update-radio-show.dto';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class RadioShowService {
    constructor(
        @Inject('DATABASE')
        private db: MySql2Database<typeof schema>
    ){}

    async create(createRadioShowDto: CreateRadioShowDto): Promise<SelectRadioShow> {
        // Insert the new radio show into the database
        // MySQL does not support .returning(), so we need to get the insertId and fetch the row
        const result = await this.db
            .insert(schema.radioShows)
            .values({
                name: createRadioShowDto.name,
                stationId: createRadioShowDto.stationId,
                days: JSON.stringify(createRadioShowDto.days), // ensure days is stored as string
                airTime: createRadioShowDto.airTime,
            });

        // Get the insertId from the result
        const insertId = result[0].insertId;

        // Fetch the newly created radio show with its station joined
        const [showWithStation] = await this.db
            .select({
                id: schema.radioShows.id,
                name: schema.radioShows.name,
                createdAt: schema.radioShows.createdAt,
                updatedAt: schema.radioShows.updatedAt,
                stationId: schema.radioShows.stationId,
                days: schema.radioShows.days,
                airTime: schema.radioShows.airTime,
                station_id: schema.radioStations.id,
                station_name: schema.radioStations.name,
                station_link: schema.radioStations.link,
                station_logo: schema.radioStations.logo,
                station_isActive: schema.radioStations.isActive,
                station_createdAt: schema.radioStations.createdAt,
                station_updatedAt: schema.radioStations.updatedAt,
            })
            .from(schema.radioShows)
            .leftJoin(
                schema.radioStations,
                eq(schema.radioShows.stationId, schema.radioStations.id)
            )
            .where(eq(radioShows.id, insertId));

        // Return the show with station info
        return showWithStation;
    }
    async findAll(filters: {
        name?: string;
        stationId?: number;
        day?: string;
        airTime?: string;
        page?: number;
        limit?: number;
    }) {
        const {
            name,
            stationId,
            day,
            airTime,
            page = 1,
            limit = 20,
        } = filters;

        // Build where conditions
        const whereClauses: any[] = [];
        if (name) {
            whereClauses.push(like(schema.radioShows.name, `%${name}%`));
        }
        if (stationId) {
            whereClauses.push(eq(schema.radioShows.stationId, stationId));
        }
        if (airTime) {
            whereClauses.push(eq(schema.radioShows.airTime, airTime));
        }
        if (day) {
            // days is stored as JSON string array, so we use LIKE for simple matching
            whereClauses.push(like(schema.radioShows.days, `%${day}%`));
        }

        // Pagination
        const offset = (page - 1) * limit;

        // Query
        const query = this.db
            .select({
                id: schema.radioShows.id,
                name: schema.radioShows.name,
                createdAt: schema.radioShows.createdAt,
                updatedAt: schema.radioShows.updatedAt,
                stationId: schema.radioShows.stationId,
                days: schema.radioShows.days,
                airTime: schema.radioShows.airTime,
                station_id: schema.radioStations.id,
                station_name: schema.radioStations.name,
                station_link: schema.radioStations.link,
                station_logo: schema.radioStations.logo,
                station_isActive: schema.radioStations.isActive,
                station_createdAt: schema.radioStations.createdAt,
                station_updatedAt: schema.radioStations.updatedAt,
            })
            .from(schema.radioShows)
            .leftJoin(
                schema.radioStations,
                eq(schema.radioShows.stationId, schema.radioStations.id)
            )
            .limit(limit)
            .offset(offset);

        if (whereClauses.length > 0) {
            query.where(and(...whereClauses));
        }

        const results = await query;

        // Optionally, parse days from JSON string to array
        return results.map(show => ({
            ...show,
            days: (() => {
                try {
                    return JSON.parse(show.days);
                } catch {
                    return show.days;
                }
            })(),
        }));
    }
    //findAllByUser
    async findAllByUser(
        user: { role: number, stationIds: number[] },
        params?: {
            name?: string;
            stationId?: number;
            day?: string;
            airTime?: string;
            page?: number;
            limit?: number;
        }
    ): Promise<any[]> {
        const {
            name,
            stationId,
            day,
            airTime,
            page = 1,
            limit = 10,
        } = params || {};

        const whereClauses: any[] = [];

        if (name) {
            whereClauses.push(like(schema.radioShows.name, `%${name}%`));
        }
        if (stationId) {
            whereClauses.push(eq(schema.radioShows.stationId, stationId));
        }
        if (airTime) {
            whereClauses.push(like(schema.radioShows.airTime, `%${airTime}%`));
        }
        if (day) {
            whereClauses.push(like(schema.radioShows.days, `%${day}%`));
        }

        // Restrict by user's stationIds unless admin
        if (user.role !== USER_ROLE.ROLE_ADMIN && Array.isArray(user.stationIds) && user.stationIds.length > 0) {
            whereClauses.push(
                inArray(schema.radioShows.stationId, user.stationIds)
            );
        }

        const offset = (page - 1) * limit;

        const query = this.db
            .select({
                id: schema.radioShows.id,
                name: schema.radioShows.name,
                createdAt: schema.radioShows.createdAt,
                updatedAt: schema.radioShows.updatedAt,
                stationId: schema.radioShows.stationId,
                days: schema.radioShows.days,
                airTime: schema.radioShows.airTime,
                station_id: schema.radioStations.id,
                station_name: schema.radioStations.name,
                station_link: schema.radioStations.link,
                station_logo: schema.radioStations.logo,
                station_isActive: schema.radioStations.isActive,
                station_createdAt: schema.radioStations.createdAt,
                station_updatedAt: schema.radioStations.updatedAt,
            })
            .from(schema.radioShows)
            .leftJoin(
                schema.radioStations,
                eq(schema.radioShows.stationId, schema.radioStations.id)
            )
            .limit(limit)
            .offset(offset);

        if (whereClauses.length > 0) {
            query.where(and(...whereClauses));
        }

        const results = await query;

        // Optionally, parse days from JSON string to array
        return results.map(show => ({
            ...show,
            days: (() => {
                try {
                    return JSON.parse(show.days);
                } catch {
                    return show.days;
                }
            })(),
        }));
    }

    async findOne(id: number) {
        // Fetch the radio show with its station joined
        const [showWithStation] = await this.db
            .select({
                id: schema.radioShows.id,
                name: schema.radioShows.name,
                createdAt: schema.radioShows.createdAt,
                updatedAt: schema.radioShows.updatedAt,
                stationId: schema.radioShows.stationId,
                days: schema.radioShows.days,
                airTime: schema.radioShows.airTime,
                station_id: schema.radioStations.id,
                station_name: schema.radioStations.name,
                station_link: schema.radioStations.link,
                station_logo: schema.radioStations.logo,
                station_isActive: schema.radioStations.isActive,
                station_createdAt: schema.radioStations.createdAt,
                station_updatedAt: schema.radioStations.updatedAt,
            })
            .from(schema.radioShows)
            .leftJoin(
                schema.radioStations,
                eq(schema.radioShows.stationId, schema.radioStations.id)
            )
            .where(eq(schema.radioShows.id, id))
            .limit(1);

        if (!showWithStation) {
            throw new NotFoundException(`Radio Show with ID ${id} not found`);
        }

        // Optionally, parse days from JSON string to array
        return {
            ...showWithStation,
            days: (() => {
                try {
                    return JSON.parse(showWithStation.days);
                } catch {
                    return showWithStation.days;
                }
            })(),
        };
    }


    // Delete a radio show
    async remove(id: number) {
        // Optionally, fetch the show before deleting for return
        const show = await this.findOne(id);
        if (!show) {
            return null;
        }
        await this.db
            .delete(schema.radioShows)
            .where(eq(schema.radioShows.id, id));
        return show;
    }
    async update(id: number, updateRadioShowDto: UpdateRadioShowDto) {
        // Update the radio show
        await this.db
            .update(schema.radioShows)
            .set({
                ...updateRadioShowDto,
                days: updateRadioShowDto.days ? JSON.stringify(updateRadioShowDto.days) : undefined,
                updatedAt: new Date(),
            })
            .where(eq(schema.radioShows.id, id));

        // Return the updated show
        const updated = await this.findOne(id);
        if (!updated) throw new NotFoundException('Radio show not found');
        return updated;
    }


}
