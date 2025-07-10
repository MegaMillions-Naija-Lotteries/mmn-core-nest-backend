import {
    mysqlTable,
    int,
    varchar,
    timestamp,
  } from "drizzle-orm/mysql-core";
  
  export const paymentMethodConfigs = mysqlTable("Paymentmethodconfig", {
    id: int("id").primaryKey().autoincrement().notNull(),
  
    logo: varchar("logo", { length: 255 }),
    name: varchar("name", { length: 255 }),
    label: varchar("label", { length: 255 }),
    link: varchar("link", { length: 255 }),
    config: varchar("config", { length: 255 }),
    status: int("status"),
    acaptureMethod: varchar("acapture_method", { length: 255 }),
  
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
    deletedAt: timestamp("deleted_at"),
  });
export type CreatePaymentMethodConfig = typeof paymentMethodConfigs.$inferInsert;
export type SelectPaymentMethodConfig = typeof paymentMethodConfigs.$inferSelect;
