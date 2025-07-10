import {
  mysqlTable,
  int,
  timestamp,
  date,
  mysqlEnum,
  datetime,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { radioShows } from "./radio-show.entity";
import { users } from "./user.entity"; // adjust the path to your actual user entity

export const radioShowSessions = mysqlTable("radio_show_sessions", {
  id: int("id").primaryKey().autoincrement(),
  showId: int("show_id").notNull(),
  stationId: int("station_id").notNull(),
  userId: int("user_id").notNull(),
  startTime: datetime("start_time").notNull(),
  endTime: datetime("end_time"),
  status: mysqlEnum("status", ["active", "ended", "paused"]).notNull().default("active"),
  sessionDate: date("session_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
export const radioShowSessionsRelations = relations(radioShowSessions, ({ one }) => ({
  show: one(radioShows, {
    fields: [radioShowSessions.showId],
    references: [radioShows.id],
    relationName: "FK_RADIO_SHOW_SESSIONS_SHOW_ID",
  }),
  user: one(users, {
    fields: [radioShowSessions.userId],
    references: [users.id],
    relationName: "FK_RADIO_SHOW_SESSIONS_USER_ID",
  }),
}));
export type CreateRadioShowSession = typeof radioShowSessions.$inferInsert;
export type SelectRadioShowSession = typeof radioShowSessions.$inferSelect;
