import {
    mysqlTable,
    int,
    varchar,
    timestamp,
    datetime,
  } from "drizzle-orm/mysql-core";
  import { uniqueIndex } from "drizzle-orm/mysql-core";
  
  export const managers = mysqlTable(
    "Managers",
    {
      id: int("id").primaryKey().autoincrement().notNull(),
  
      name: varchar("name", { length: 255 }),
      email: varchar("email", { length: 255 }),
      password: varchar("password", { length: 255 }),
  
      parentId: int("parent_id"),
      contactNumber1: varchar("contact_number_1", { length: 255 }),
      contactNumber2: varchar("contact_number_2", { length: 255 }),
      address1: varchar("address_1", { length: 255 }),
      address2: varchar("address_2", { length: 255 }),
  
      countryId: int("country_id"),
      state: varchar("state", { length: 255 }),
      city: varchar("city", { length: 255 }),
      postalCode: varchar("postal_code", { length: 255 }),
  
      sipAgentId: varchar("sip_agent_id", { length: 255 }),
      status: int("status"),
      roleId: int("role_id"),
      mlmRoleId: int("mlm_role_id"),
      createdBy: int("created_by"),
  
      emailVerifiedAt: datetime("email_verified_at"),
      rememberToken: varchar("remember_token", { length: 255 }),
      percentSetting: varchar("percent_setting", { length: 255 }),
      agentType: int("agent_type"),
      commissionSharesPercent: int("commission_shares_percent"),
  
      createdAt: timestamp("created_at"),
      updatedAt: timestamp("updated_at"),
      deletedAt: timestamp("deleted_at"),
    },
    (table) => ({
      uniqueManagerId: uniqueIndex("UNIQUE_MANAGERS_ID").on(table.id),
    })
  );
  export type CreateManager = typeof managers.$inferInsert;
  export type SelectManager = typeof managers.$inferSelect;
    