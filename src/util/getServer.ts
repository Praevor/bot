import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { serversTable } from '../db/schema.js';

/**
 * gets info of a guild
 * @param id the guild id
 */
export async function getServer(id: string) {
	const [server] = await db
		.select({
			id: serversTable.id,
			managerRoleId: serversTable.managerRoleId,
			moderatorRoleId: serversTable.moderatorRoleId,
			logChannelId: serversTable.logChannelId,
		})
		.from(serversTable)
		.where(eq(serversTable.id, id))
		.limit(1);

	if (!server) return;

	return server;
}
