import { and, eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { moderationsTable } from '../db/schema.js';

export async function getModerations(robloxUsername: string, guildId: string) {
	const moderaions = await db
		.select()
		.from(moderationsTable)
		.where(and(eq(moderationsTable.robloxUsername, robloxUsername), eq(moderationsTable.serverId, guildId)));

	return moderaions;
}
