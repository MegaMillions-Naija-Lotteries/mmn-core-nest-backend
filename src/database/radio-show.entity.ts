import {
    mysqlTable,
    int,
    varchar,
    time,
    timestamp,
  } from "drizzle-orm/mysql-core";
  import { relations } from "drizzle-orm";
  import { radioStations } from "./radio-station.entity"; // make sure this points to the right file
  
  export const radioShows = mysqlTable("radio_shows", {
    id: int("id").primaryKey().autoincrement(),
    name: varchar("name", { length: 255 }).notNull(),
    days: varchar("days", { length: 500 }).notNull(), // JSON string of days
    airTime: time("air_time").notNull(),
    stationId: int("station_id").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  });
  
  export const radioShowsRelations = relations(radioShows, ({ one }) => ({
    station: one(radioStations, {
      fields: [radioShows.stationId],
      references: [radioStations.id],
      relationName: "FK_RADIO_SHOWS_STATION_ID",
    }),
  }));
  
  export type CreateRadioShow = typeof radioShows.$inferInsert;
  export type SelectRadioShow = typeof radioShows.$inferSelect;
  