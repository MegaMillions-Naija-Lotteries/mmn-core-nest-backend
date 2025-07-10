import {
    mysqlTable,
    int,
    varchar,
    timestamp,
    datetime,
  } from "drizzle-orm/mysql-core";
  
  export const transactions = mysqlTable("Transaction", {
    id: int("id").primaryKey().autoincrement().notNull(),
  
    idUser: int("id_user"),
    idManager: int("id_manager"),
    idPaymentMethod: int("id_payment_method"),
    amount: int("amount"),
    status: varchar("status", { length: 255 }),
    type: varchar("type", { length: 255 }),
    bonusType: varchar("bonus_type", { length: 255 }),
    paymentRef: varchar("payment_ref", { length: 255 }),
    idPaymentMethodConfig: int("id_payment_method_config"),
    description: varchar("description", { length: 255 }),
    idObjector: int("id_objector"),
    idObjectorPaymentMethod: int("id_objector_payment_method"),
    idRef: int("id_ref"),

    date: datetime("date").notNull().default(new Date()),

    idOrder: int("id_order"),
    orderNo: varchar("order_no", { length: 255 }),
    logId: varchar("log_id", { length: 255 }),
    idWithdrawal: int("id_withdrawal"),
    idGroup: int("id_group"),
    idDraw: int("id_draw"),
    idPlaywin: int("id_playwin"),
    idVoucherUser: int("id_voucher_user"),
    idAgent: int("id_agent"),
    idTerminal: int("id_terminal"),
    reason: varchar("reason", { length: 255 }),
    mlmLevel: int("mlm_level"),
    idSuper: int("id_super"),
    idSales: int("id_sales"),
  
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
    deletedAt: timestamp("deleted_at"),
  });
  export type CreateTransaction = typeof transactions.$inferInsert;
  export type SelectTransaction = typeof transactions.$inferSelect;
    