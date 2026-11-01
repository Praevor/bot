import { pgTable, integer, varchar } from "drizzle-orm/pg-core";

export const serversTable = pgTable("servers", {
    id: integer().primaryKey().unique(), // discord server id
    key: varchar({length: 255}).notNull(), // hashed server key
})
