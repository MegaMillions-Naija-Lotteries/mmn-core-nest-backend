import {
  mysqlTable,
  int,
  varchar,
  text,
  datetime,
  mysqlEnum,
  decimal,
  json,
  index,
  timestamp,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { radioTickets } from "./radio-ticket.entity";
import { radioStations } from "./radio-station.entity";

export const radioJackpotDraws = mysqlTable(
  "radio_jackpot_draws",
  {
    id: int("id").primaryKey().autoincrement().notNull(),

    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),

    stationId: int("station_id").references(() => radioStations.id, {
      onUpdate: "cascade",
      onDelete: "set null",
    }),

    drawPeriod: mysqlEnum("draw_period", [
      "daily",
      "weekly",
      "biweekly",
      "monthly",
      "quarterly",
      "custom",
    ]).notNull(),

    periodStart: datetime("period_start").notNull(),
    periodEnd: datetime("period_end").notNull(),
    scheduledAt: datetime("scheduled_at").notNull(),
    conductedAt: datetime("conducted_at"),
    prizeAmount: decimal("prize_amount", { precision: 10, scale: 2 }).notNull(),

    status: mysqlEnum("status", [
      "pending",
      "active",
      "completed",
      "cancelled",
    ]).notNull().default("pending"),

    jackpotSettings: json("jackpot_settings").default({}),
    winnerDetails: json("winner_details").default({}),
    previousWinners: json("previous_winners").default([]),

    totalTickets: int("total_tickets").notNull().default(0),
    totalEntries: int("total_entries").notNull().default(0),
    eligibleUsers: int("eligible_users").notNull().default(0),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),

    winningTicketId: int("winning_ticket_id").references(() => radioTickets.id, {
      onUpdate: "cascade",
      onDelete: "set null",
    }),
  },
  (table) => ({
    idxStationId: index("idx_station_id").on(table.stationId),
    idxStatus: index("idx_status").on(table.status),
    idxDrawPeriod: index("idx_draw_period").on(table.drawPeriod),
    idxScheduledAt: index("idx_scheduled_at").on(table.scheduledAt),
    idxPeriodRange: index("idx_period_range").on(table.periodStart, table.periodEnd),
    idxWinningTicketId: index("idx_winning_ticket_id").on(table.winningTicketId),
  })
);

export type SelectRadioJackpotDraw = typeof radioJackpotDraws.$inferSelect;
export type CreateRadioJackpotDraw = typeof radioJackpotDraws.$inferInsert;