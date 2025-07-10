import { boolean, int, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

export const radioStations = mysqlTable('stations', {
    id: int('id').primaryKey().autoincrement(),
    name: varchar('name', { length: 255 }).notNull(),
    link: varchar('link', { length: 255 }).notNull(),
    logo: varchar('logo', { length: 255 }).notNull(),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export type CreateRadioStation = typeof radioStations.$inferInsert;
export type SelectRadioStation = typeof radioStations.$inferSelect;