import {
    mysqlTable,
    int,
    varchar,
    timestamp,
    datetime,
  } from "drizzle-orm/mysql-core";
  
  export const transactions = mysqlTable("transaction", {
    id: int("id").primaryKey().autoincrement().notNull(),
  
    idUser: int("idUser"),
    idManager: int("idManager"),
    idPaymentMethod: int("idPaymentMethod"),
    amount: int("amount"),
    status: varchar("status", { length: 255 }),
    type: varchar("type", { length: 255 }),
    bonusType: varchar("bonusType", { length: 255 }),
    paymentRef: varchar("paymentRef", { length: 255 }),
    idPaymentMethodConfig: int("idPaymentMethodConfig"),
    description: varchar("description", { length: 255 }),
    idObjector: int("idObjector"),
    idObjectorPaymentMethod: int("idObjectorPaymentMethod"),
    idRef: int("idRef"),

    date: datetime("date").notNull().default(new Date()),

    idOrder: int("idOrder"),
    orderNo: varchar("orderNo", { length: 255 }),
    logId: varchar("logId", { length: 255 }),
    idWithdrawal: int("idWithdrawal"),
    idGroup: int("idGroup"),
    idDraw: int("idDraw"),
    idPlaywin: int("idPlaywin"),
    idVoucherUser: int("idVoucherUser"),
    idAgent: int("idAgent"),
    idTerminal: int("idTerminal"),
    reason: varchar("reason", { length: 255 }),
    mlmLevel: int("mlm_level"),
    idSuper: int("idSuper"),
    idSales: int("idSales"),
  
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
    deletedAt: timestamp("deleted_at"),
  });
  export type CreateTransaction = typeof transactions.$inferInsert;
  export type SelectTransaction = typeof transactions.$inferSelect;
    