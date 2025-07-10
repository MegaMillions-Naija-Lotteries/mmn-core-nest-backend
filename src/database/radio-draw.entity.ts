import {
    mysqlTable,
    int,
    varchar,
    text,
    timestamp,
    datetime,
    mysqlEnum,
    json,
  } from "drizzle-orm/mysql-core";
  import { relations } from "drizzle-orm";
  import { radioShowSessions } from "./radio-show-session.entity";
  import { radioShows } from "./radio-show.entity";
  import { radioTickets } from "./radio-ticket.entity";
  
  export const radioDraws = mysqlTable("radio_draws", {
    id: int("id").primaryKey().autoincrement(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    sessionId: int("session_id").notNull(),
    showId: int("show_id").notNull(),
    drawNumber: int("draw_number").notNull(),
    scheduledAt: datetime("scheduled_at").notNull(),
    conductedAt: datetime("conducted_at"),
    winningTicketId: int("winning_ticket_id"),
    status: mysqlEnum("status", ["pending", "active", "completed", "cancelled"]).notNull().default("pending"),
    maxEntries: int("max_entries"),
    entryDeadline: datetime("entry_deadline"),
    prizes: json("prizes"),
    drawSettings: json("draw_settings"),
    winnerDetails: json("winner_details"),
    totalEntries: int("total_entries").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  });
  export const radioDrawRelations = relations(radioDraws, ({ one }) => ({
    session: one(radioShowSessions, {
      fields: [radioDraws.sessionId],
      references: [radioShowSessions.id],
    }),
    show: one(radioShows, {
      fields: [radioDraws.showId],
      references: [radioShows.id],
    }),
    winningTicket: one(radioTickets, {
      fields: [radioDraws.winningTicketId],
      references: [radioTickets.id],
    }),
  }));
  export type CreateRadioDraw = typeof radioDraws.$inferInsert;
  export type SelectRadioDraw = typeof radioDraws.$inferSelect;
    