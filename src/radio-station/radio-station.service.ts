import { Injectable, Inject, NotFoundException } from "@nestjs/common";

import { schema, stationUsers, users } from '../database/schema';
import type { MySql2Database } from "drizzle-orm/mysql2";
import { CreateRadioStationDto } from "./dto/create-radio-station.dto";
import { UpdateRadioStationDto } from "./dto/update-radio-station.dto";
import { radioStations, SelectRadioStation } from "../database/radio-station.entity";
import { eq, like, and, sql, inArray } from "drizzle-orm";
import { USER_ROLE } from "src/auth/roles/roles.constant";

@Injectable()
export class RadioStationService {
    constructor(
        @Inject('DATABASE')
        private db: MySql2Database<typeof schema>
    ) {}
    
    // create a radio station
    async create(createRadioStationDto: CreateRadioStationDto): Promise<SelectRadioStation> {
        //insert into the db
        const result = await this.db
            .insert(radioStations)
            .values(createRadioStationDto);
        // get the id of the new row
        const insertId = result[0].insertId;
        // use it to get the row
        const [station] = await this.db
            .select()
            .from(radioStations)
            .where(eq(radioStations.id, insertId))
            .limit(1);

        return station;
    }


    async findAll(params?: {
    name?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
    sortBy?: keyof typeof radioStations;
    sortOrder?: 'asc' | 'desc';
    } ): Promise<{
    data: SelectRadioStation[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    }> {
    const {
        name,
        isActive,
        page = 1,
        limit = 10,
        sortBy = 'name',
        sortOrder = 'asc',
    } = params || {};

    const offset = (page - 1) * limit;
    const conditions :any[]= [];

    if (name) {
        conditions.push(like(radioStations.name, `%${name}%`));
    }

    if (isActive !== undefined) {
        conditions.push(eq(radioStations.isActive, isActive));
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;

    // Total count
    const totalResult = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(radioStations)
        .where(whereClause);

    const total = totalResult[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    // Sort field
    const sortColumn = radioStations[sortBy] as any;

    const data = await this.db
        .select()
        .from(radioStations)
        .where(whereClause)
        .orderBy(
            sortOrder === 'desc'
                ? sql`${sortColumn} DESC`
                : sql`${sortColumn} ASC`
        )
        .limit(limit)
        .offset(offset);

    return {
        data,
        meta: {
            page,
            limit,
            total,
            totalPages,
        },
    };
    }
    async findAllByUser( 
      user: { role: number, stationIds: number[]},
      params?: {
    name?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
    sortBy?: keyof typeof radioStations;
    sortOrder?: 'asc' | 'desc';
    } ): Promise<{
    data: SelectRadioStation[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    }> {
    const {
        name,
        isActive,
        page = 1,
        limit = 10,
        sortBy = 'name',
        sortOrder = 'asc',
    } = params || {};

    const offset = (page - 1) * limit;
    const conditions :any[]= [];

    if (name) {
        conditions.push(like(radioStations.name, `%${name}%`));
    }

    if (isActive !== undefined) {
        conditions.push(eq(radioStations.isActive, isActive));
    }

    if (user.role !== USER_ROLE.ROLE_ADMIN){
      conditions.push(inArray(radioStations.id, user.stationIds))
    }
    const whereClause = conditions.length ? and(...conditions) : undefined;

    // Total count
    const totalResult = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(radioStations)
        .where(whereClause);

    const total = totalResult[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    // Sort field
    const sortColumn = radioStations[sortBy] as any;

    const data = await this.db
        .select()
        .from(radioStations)
        .where(whereClause)
        .orderBy(
            sortOrder === 'desc'
                ? sql`${sortColumn} DESC`
                : sql`${sortColumn} ASC`
        )
        .limit(limit)
        .offset(offset);

    return {
        data,
        meta: {
            page,
            limit,
            total,
            totalPages,
        },
    };
    }

    async findOne(id: number):Promise<SelectRadioStation>{
        const [station] = await this.db.select()
        .from(radioStations)
        .where(eq(radioStations.id, id))
        .limit(1);

        if(!station) {
            throw new NotFoundException(`Radio Station with ID ${id} not found`)
        }

        return station;
    }

    async update(id: number, updateRadioStationDto: UpdateRadioStationDto): Promise<SelectRadioStation> {
        const updateData = {
          ...updateRadioStationDto,
          updatedAt: sql`CURRENT_TIMESTAMP`,
        };
    
        await this.db
          .update(radioStations)
          .set(updateData)
          .where(eq(radioStations.id, id));
        
        // Get the updated record
        const [updatedStation] = await this.db
          .select()
          .from(radioStations)
          .where(eq(radioStations.id, id))
          .limit(1);
        
        if (!updatedStation) {
          throw new NotFoundException(`Radio station with ID ${id} not found`);
        }
        
        return updatedStation;
    }

    async remove(id: number): Promise<{ message: string }> {
      // First get the station to return its name
      const [stationToDelete] = await this.db
        .select()
        .from(radioStations)
        .where(eq(radioStations.id, id))
        .limit(1);
      
      if (!stationToDelete) {
        throw new NotFoundException(`Radio station with ID ${id} not found`);
      }
      
      await this.db
        .delete(radioStations)
        .where(eq(radioStations.id, id));
      
      return { message: `Radio station ${stationToDelete.name} has been deleted` };
    }

    async attachUserToStation(
      stationId: number,
      userId: number,
      newRole: number
    ): Promise<{ message: string }> {
      // Check if the station exists
      const [station] = await this.db
        .select()
        .from(radioStations)
        .where(eq(radioStations.id, stationId))
        .limit(1);

      if (!station) {
        throw new NotFoundException(`Radio station with ID ${stationId} not found`);
      }

      // Check if the user exists
      const [user] = await this.db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Attach the user to the station (if not already attached)
      const [existingLink] = await this.db
        .select()
        .from(stationUsers)
        .where(
          // Combine the conditions using 'and'
          and(
            eq(stationUsers.userId, userId),
            eq(stationUsers.stationId, stationId)
          )
        )
        .limit(1);

      if (!existingLink) {
        await this.db.insert(stationUsers).values({
          userId,
          stationId,
        });
      }

      // Update the user's role
      await this.db
        .update(users)
        .set({ role: newRole })
        .where(eq(users.id, userId));

      return {
        message: `User ${userId} has been attached to station ${stationId} and role updated.`,
      };
    }

}
