import { pgTable, text, varchar } from "drizzle-orm/pg-core";

export const serversTable = pgTable("servers", {
    id: varchar({length: 255}).primaryKey().unique(), // discord server id
    key: text("key"), // encrypted server key
    managerRoleId: varchar({length: 255}).notNull(),
    moderatorRoleId: varchar({length: 255}).notNull()
})
