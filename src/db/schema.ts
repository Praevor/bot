import { pgTable, varchar } from "drizzle-orm/pg-core";

export const serversTable = pgTable("servers", {
    id: varchar({length: 255}).primaryKey().unique(), // discord server id
    key: varchar({length: 255}), // hashed server key
    managerRoleId: varchar({length: 255}),
})
