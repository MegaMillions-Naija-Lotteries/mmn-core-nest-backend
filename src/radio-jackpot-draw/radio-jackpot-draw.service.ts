import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { eq, and, between, sql } from 'drizzle-orm';
import { randomInt } from 'crypto';
import { radioJackpotDraws } from '../database/schema';
import { CreateRadioJackpotDrawDto } from './dto/create-radio-jackpot-draw.dto';
import { radioTickets } from '../database/radio-ticket.entity';
import { users } from '../database/user.entity';
import { radioShows } from '../database/radio-show.entity';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { schema } from '../database/schema';
import type { InferInsertModel } from 'drizzle-orm';

interface WinnerDetails {
  userId: number;
  ticketId: number;
  phone: string;
}

@Injectable()
export class RadioJackpotDrawService {
  
  constructor(@Inject('DATABASE') private readonly db: MySql2Database<typeof schema>) {}
  async create(dto: CreateRadioJackpotDrawDto) { 
    const insertData: InferInsertModel<typeof radioJackpotDraws> = {
      title: dto.title,
      description: dto.description,
      stationId: typeof dto.stationId === 'number' ? dto.stationId : Number(dto.stationId),
      drawPeriod: dto.drawPeriod,
      periodStart: new Date(dto.periodStart),
      periodEnd: new Date(dto.periodEnd),
      scheduledAt: new Date(dto.scheduledAt),
      prizeAmount: String(dto.prizeAmount),
    };
    const [row] = await this.db.insert(radioJackpotDraws).values(insertData).$returningId();
    const updateStatus = await this.db.update(radioJackpotDraws).set({ status: 'active' }).where(eq(radioJackpotDraws.id, row.id));
    console.log(updateStatus)
    const draw = await this.details(row.id).then(r => r[0]);
    return {
      id: draw.id,
      title: draw.title,
      station: draw.stationId,
      date: draw.periodStart.toLocaleDateString(),
      amount: Number(draw.prizeAmount),
    };
  }

  async list() {
    return this.db.select().from(radioJackpotDraws);
  }

  async details(id: number) {
    return this.db.select().from(radioJackpotDraws).where(eq(radioJackpotDraws.id, id)).limit(1);
  }

  async conduct(id: number, showId: number) {
    try {
      const draw = await this.details(id).then(r => r[0]);
      if (!draw) throw new BadRequestException('Draw not found');
      if (draw.status !== 'active') throw new BadRequestException('Draw not active');

      // eligible tickets
    const eligible = await this.db
      .select({ id: radioTickets.id, user_id: radioTickets.userId })
      .from(radioTickets)
      .where(between(radioTickets.createdAt, draw.periodStart, draw.periodEnd));

    const tickets = eligible;
    if (tickets.length === 0) {
      await this.db.update(radioJackpotDraws).set({ status: 'completed', conductedAt: new Date() }).where(eq(radioJackpotDraws.id, id));
      return { ...draw, winningTicketId: null };
    }

    const winnerIndex = randomInt(0, tickets.length);
    const winner = tickets[winnerIndex];


    // Get the user details including phone number
    const winnerDetails = await this.db
      .select({
        userId: radioTickets.userId,
        ticketId: radioTickets.id,
        phone: users.phone
      })
      .from(radioTickets)
      .leftJoin(users, eq(users.id, radioTickets.userId))
      .where(eq(radioTickets.id, winner.id))
      .then(result => {
        if (!result[0]) {
          throw new BadRequestException(`No ticket found with id ${winner.id}`);
        }
        return result[0];
      });

    // Extract the winner's user ID from the winnerDetails
    const winnerUserId = winnerDetails.userId;
    if (!winnerUserId) {
      throw new BadRequestException(`Winner details are missing userId`);
    }

    await this.db.update(radioJackpotDraws)
      .set({
        conductedAt: new Date(),
        status: 'completed',
        winningTicketId: winner.id,
        winnerDetails: winnerDetails,
        previousWinners: sql`JSON_ARRAY_APPEND(previous_winners, '$', JSON_OBJECT('userId', ${winnerUserId}, 'ticketId', ${winner.id}))` as unknown as string, // Cast to string to resolve type issues
        totalTickets: tickets.length,
        showId: showId,
      })
      .where(eq(radioJackpotDraws.id, id));

    return this.details(id).then(r => r[0]);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async createAndConduct(dto: CreateRadioJackpotDrawDto) {
    const draw = await this.create(dto);
    // await this.db.update(radioJackpotDraws).set({ status: 'active' }).where(eq(radioJackpotDraws.id, draw.id));
    // return this.conduct(draw.id);
  }

  // async redraw(id: number) {
  //   const draw = await this.details(id).then(r => r[0]);
  //   if (!draw || draw.status !== 'completed') throw new BadRequestException('Draw not completed');
  //   // reset winner
  //   const [drawWithWinnerDetails] = await this.db.select()
  //   .from(radioJackpotDraws)
  //   .where(eq(radioJackpotDraws.id, id))
  //   .limit(1);

  //   if (!drawWithWinnerDetails?.winnerDetails) {
  //     throw new BadRequestException('Winner details not found');
  //   }

  //   await this.db.update(radioJackpotDraws)
  //     .set({
  //       status: 'active',
  //       conductedAt: null,
  //       winningTicketId: null,        
  //       previousWinners: sql`JSON_ARRAY_APPEND(previous_winners, '$', JSON_OBJECT('phone', ${drawWithWinnerDetails.winnerDetails.phone}, 'userId', ${drawWithWinnerDetails.winnerDetails.userId}, 'ticketId', ${drawWithWinnerDetails.winnerDetails.ticketId}))` as unknown as string,
  //       winnerDetails: null,
  //     })
  //     .where(eq(radioJackpotDraws.id, id));
  //   return this.conduct(id, draw.showId||1);
  // }
  // async redraw(id: number) {
  //   const draw = await this.details(id).then(r => r?.[0]);
  //   // if (!draw || draw.status !== 'completed') {
  //   //   throw new BadRequestException('Draw not completed');
  //   // }
  
  //   // Fetch current draw with winner details
  //   interface DrawWithWinnerDetails {
  //     winnerDetails: {
  //       userId: number;
  //       ticketId: number;
  //       phone: string;
  //     } | null;
  //   }
    
  //   const [drawWithWinnerDetails] = await this.db
  //     .select()
  //     .from(radioJackpotDraws)
  //     .where(eq(radioJackpotDraws.id, id))
  //     .limit(1) as DrawWithWinnerDetails[];
  //   const winner = drawWithWinnerDetails?.winnerDetails;
  //   // if (!winner || !winner.userId || !winner.ticketId || !winner.phone) {
  //   //   throw new BadRequestException('Incomplete winner details');
  //   // }
  
  //   await this.db.update(radioJackpotDraws)
  //     .set({
  //       status: 'active',
  //       conductedAt: null,
  //       winningTicketId: null,
  //       previousWinners: sql`JSON_ARRAY_APPEND(previous_winners, '$', JSON_OBJECT(
  //         'phone', ${winner?.phone},
  //         'userId', ${winner?.userId},
  //         'ticketId', ${winner?.ticketId}
  //       ))` as unknown as string,
  //       winnerDetails: null,
  //     })
  //     .where(eq(radioJackpotDraws.id, id));
  
  //   return this.conduct(id, draw.showId ?? 1);
  // }
  async redraw(id: number) {
    const draw = await this.details(id).then(r => r?.[0]);
    
    if (!draw || draw.status !== 'completed') {
      throw new BadRequestException('Draw not completed');
    }
  
    // Fetch current draw with winner details
    interface DrawWithWinnerDetails {
      winnerDetails: {
        userId: number;
        ticketId: number;
        phone: string;
      } | null;
      previousWinners: any[] | null;
    }
  
    const [drawWithWinnerDetails] = await this.db
      .select()
      .from(radioJackpotDraws)
      .where(eq(radioJackpotDraws.id, id))
      .limit(1) as DrawWithWinnerDetails[];
  
    if (!drawWithWinnerDetails) {
      throw new BadRequestException('Draw not found');
    }
  
    const winner = drawWithWinnerDetails.winnerDetails;
    
    if (!winner || !winner.userId || !winner.ticketId || !winner.phone) {
      throw new BadRequestException('Incomplete winner details');
    }
  
    // Handle previousWinners array properly
    let previousWinnersUpdate;
    if (drawWithWinnerDetails.previousWinners === null) {
      // If previousWinners is null, create a new JSON array with the winner
      previousWinnersUpdate = sql`JSON_ARRAY(JSON_OBJECT(
        'phone', ${winner.phone},
        'userId', ${winner.userId},
        'ticketId', ${winner.ticketId}
      ))`;
    } else {
      // If previousWinners exists, append to it
      previousWinnersUpdate = sql`JSON_ARRAY_APPEND(previous_winners, '$', JSON_OBJECT(
        'phone', ${winner.phone},
        'userId', ${winner.userId},
        'ticketId', ${winner.ticketId}
      ))`;
    }
  
    await this.db.update(radioJackpotDraws)
      .set({
        status: 'active',
        conductedAt: null,
        winningTicketId: null,
        previousWinners: previousWinnersUpdate,
        winnerDetails: null,
      })
      .where(eq(radioJackpotDraws.id, id));
  
    return this.conduct(id, draw.showId ?? 1);
  }
  
}