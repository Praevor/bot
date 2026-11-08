import { EmbedBuilder, REST, Routes } from 'discord.js';
import { Result } from '../types/Result.js';
import { getServer } from './getServer.js';

export async function sendLog(title: string, description: string, guildId: string): Promise<Result<undefined>> {
	const server = await getServer(guildId);
	if (!server) return { ok: false, error: 'Not set up yet' };

	const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

	const embed = new EmbedBuilder().setTitle(title).setDescription(description);

	try {
		await rest.post(Routes.channelMessages(server.logChannelId), {
			body: {
				embeds: [embed.toJSON()],
			},
		});
	} catch {
		return { ok: false, error: "Error while sending log, check the bot's perms in the logs channel" };
	}

	return { ok: true, data: undefined };
}
