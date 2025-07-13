import {
    mysqlTable,
    int,
    varchar,
    timestamp,
  } from "drizzle-orm/mysql-core";
  
  export const paymentMethods = mysqlTable("paymentmethod", {
    id: int("id").primaryKey().autoincrement().notNull(),
  
    userId: int("userId"),
    managerId: int("managerId"),
  
    type: varchar("type", { length: 255 }),
    info: varchar("info", { length: 255 }),
    balance: int("balance"),
  
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
    deletedAt: timestamp("deleted_at"),
  });
  export type CreatePaymentMethod = typeof paymentMethods.$inferInsert;
  export type SelectPaymentMethod = typeof paymentMethods.$inferSelect;
    