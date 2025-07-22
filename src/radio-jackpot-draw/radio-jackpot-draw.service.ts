import { Inject, Injectable } from '@nestjs/common';
import { eq, and, between, sql } from 'drizzle-orm';
import { randomInt } from 'crypto';
import { radioJackpotDraws } from '../database/schema';
import { CreateRadioJackpotDrawDto } from './dto/create-radio-jackpot-draw.dto';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { schema } from '../database/schema';
import type { InferInsertModel } from 'drizzle-orm';

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
    const draw = await this.details(row.id).then(r => r[0]);
    return {
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

  async conduct(id: number) {
    const draw = await this.details(id).then(r => r[0]);
    if (!draw) throw new Error('Draw not found');
    if (draw.status !== 'active') throw new Error('Draw not active');

    // eligible tickets
    const eligible = await this.db.execute(sql`
      SELECT id, user_id FROM tickets
      WHERE created_at BETWEEN ${draw.periodStart} AND ${draw.periodEnd}
    `);

    const tickets = eligible as unknown as { id: number; user_id: number }[];
    if (tickets.length === 0) {
      await this.db.update(radioJackpotDraws).set({ status: 'completed', conductedAt: new Date() }).where(eq(radioJackpotDraws.id, id));
      return { ...draw, winningTicketId: null };
    }

    const winnerIndex = randomInt(0, tickets.length);
    const winner = tickets[winnerIndex];

    await this.db.update(radioJackpotDraws)
      .set({
        conductedAt: new Date(),
        status: 'completed',
        winningTicketId: winner.id,
        winnerDetails: { userId: winner.user_id, ticketId: winner.id },
        previousWinners: sql`JSON_ARRAY_APPEND(previous_winners, '$', JSON_OBJECT('userId', ${winner.user_id}, 'ticketId', ${winner.id}))`,
        totalTickets: tickets.length,
      })
      .where(eq(radioJackpotDraws.id, id));

    return this.details(id).then(r => r[0]);
  }

  async createAndConduct(dto: CreateRadioJackpotDrawDto) {
    const draw = await this.create(dto);
    // await this.db.update(radioJackpotDraws).set({ status: 'active' }).where(eq(radioJackpotDraws.id, draw.id));
    // return this.conduct(draw.id);
  }

  async redraw(id: number) {
    const draw = await this.details(id).then(r => r[0]);
    if (!draw || draw.status !== 'completed') throw new Error('Draw not completed');
    // reset winner
    await this.db.update(radioJackpotDraws)
      .set({
        status: 'active',
        conductedAt: null,
        winningTicketId: null,
        previousWinners: sql`JSON_ARRAY_APPEND(previous_winners, '$', ${draw.winnerDetails})`,
        winnerDetails: null,
      })
      .where(eq(radioJackpotDraws.id, id));
    return this.conduct(id);
  }
}