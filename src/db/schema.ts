import { pgTable, text, varchar, integer } from 'drizzle-orm/pg-core';

export const serversTable = pgTable('servers', {
	id: varchar({ length: 255 }).primaryKey().unique(), // discord server id
	key: text('key'), // encrypted server key
	managerRoleId: varchar({ length: 255 }).notNull(),
	moderatorRoleId: varchar({ length: 255 }).notNull(),
	logChannelId: varchar({ length: 255 }).notNull(),
});

export const moderationsTable = pgTable('moderations', {
	id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
	serverId: varchar({ length: 255 }).notNull(),
	robloxUsername: varchar({ length: 255 }).notNull(),
	robloxId: varchar({ length: 255 }).notNull(),
	punishmentType: text('punishmentType', { enum: ['WARNING', 'KICK', 'BAN'] }).notNull(),
	moderatorId: varchar({ length: 255 }).notNull(),
	reason: varchar({ length: 255 }).notNull(),
});
