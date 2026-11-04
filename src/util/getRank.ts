import { CommandInteraction, PermissionFlagsBits } from 'discord.js';
import type { Result } from '../types/Result.js';
import { db } from '../db/index.js';
import { serversTable } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export async function getRank(
	interaction: CommandInteraction,
): Promise<Result<'USER' | 'MODERATOR' | 'MANAGER' | 'ADMIN'>> {
	if (!interaction.guildId) return { ok: false, error: 'You can only use this in a server' };

	if (interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) return { ok: true, data: 'ADMIN' };

	const [server] = await db.select().from(serversTable).where(eq(serversTable.id, interaction.guildId)).limit(1);

	if (!server) return { ok: false, error: 'This server is not set up yet' };

	if (!interaction.member) return { ok: false, error: 'You can only use this in a server' };

	if (!interaction.inCachedGuild()) return { ok: false, error: 'Guild not cached, try again later' };

	if (interaction.member.roles.cache.has(server.managerRoleId)) return { ok: true, data: 'MANAGER' };
	if (interaction.member.roles.cache.has(server.moderatorRoleId)) return { ok: true, data: 'MODERATOR' };
	return { ok: true, data: 'USER' };
}
