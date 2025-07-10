import {
    mysqlTable,
    int,
    boolean,
    timestamp,
    datetime,
    index,
  } from "drizzle-orm/mysql-core";
  import { relations } from "drizzle-orm";
  import { users } from "./user.entity"; // Adjust paths as necessary
  import { radioStations } from "./radio-station.entity";
  import { radioDraws } from "./radio-draw.entity";
  
  export const radioTickets = mysqlTable("radio_tickets", (table) => ({
    id: table.int("id").primaryKey().autoincrement().notNull(),
    ticketUuid: table.varchar("ticket_uuid", { length: 36 }).notNull().unique(),
    userId: table.int("user_id").notNull(),
    stationId: table.int("station_id").notNull(),
    drawId: table.int("draw_id"),
    quantity: table.int("quantity").notNull().default(1)
      // .comment is not supported on these column definitions, so remove them
      ,
    usedCount: table.int("used_count").notNull().default(0),
    isActive: table.boolean("is_active").notNull().default(true),
    expiresAt: table.datetime("expires_at"),
    invalidatedAt: table.datetime("invalidated_at"),
    createdAt: table.timestamp("created_at").notNull().defaultNow(),
    updatedAt: table.timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  }), (table) => ({
    ticketUuidIdx: index("idx_ticket_uuid").on(table.ticketUuid),
    userIdIdx: index("idx_user_id").on(table.userId),
    stationIdIdx: index("idx_station_id").on(table.stationId),
    drawIdIdx: index("idx_draw_id").on(table.drawId),
    isActiveIdx: index("idx_is_active").on(table.isActive),
  }));
  export const radioTicketRelations = relations(radioTickets, ({ one }) => ({
    user: one(users, {
      fields: [radioTickets.userId],
      references: [users.id],
    }),
    station: one(radioStations, {
      fields: [radioTickets.stationId],
      references: [radioStations.id],
    }),
    draw: one(radioDraws, {
      fields: [radioTickets.drawId],
      references: [radioDraws.id],
    }),
  }));
  export type CreateRadioTicket = typeof radioTickets.$inferInsert;
  export type SelectRadioTicket = typeof radioTickets.$inferSelect;
      