import { mysqlTable, int, timestamp, foreignKey } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { users } from "./user.entity"; // assumed location
import { radioStations } from "./radio-station.entity"; // assumed name

export const stationUsers = mysqlTable("station_users", {
  userId: int("user_id").notNull().references(() => users.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  stationId: int("station_id").notNull().references(() => radioStations.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  pk: {
    columns: [table.userId, table.stationId],
    name: "pk_user_station",
  },
}));
export type CreateUserStation = typeof stationUsers.$inferInsert;
export type SelectUserStation = typeof stationUsers.$inferSelect;
export const userStationRelations = relations(stationUsers, ({ one }) => ({
    user: one(users, {
      fields: [stationUsers.userId],
      references: [users.id],
    }),
    station: one(radioStations, {
      fields: [stationUsers.stationId],
      references: [radioStations.id],
    }),
  }));

