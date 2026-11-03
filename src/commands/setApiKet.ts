import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import { getServer } from '../util/getServer.js';
import { Command } from './index.js';
import { addKeyToDb } from '../util/addKeyToDb.js';

export default {
	data: {
		name: 'set-api-key',
		description: "Set the API key so Praevor can fetch info about your server. It's encrypted in our databases",
		options: [
			{
				name: 'key',
				description: 'The ERLC API key',
				type: ApplicationCommandOptionType.String,
				required: true,
			},
		],
	},
	async execute(interaction) {
		const apiKey = (interaction as ChatInputCommandInteraction).options.getString('key', true);

		if (!interaction.guildId) {
			await interaction.reply({ content: 'This can be only used in servers', flags: 'Ephemeral' });
			return;
		}

		const server = await getServer(interaction.guildId);
		if (!server) {
			await interaction.reply({ content: 'This server is not set up yet with /setup', flags: 'Ephemeral' });
			return;
		}

		if (!interaction.member) return;
		if (!interaction.inCachedGuild()) return;

		if (!interaction.member.roles.cache.has(server.managerRoleId)) {
			interaction.reply({ content: "You don't have permissions to use this", flags: 'Ephemeral' });
			return;
		}

		const res = await addKeyToDb(apiKey, server.id);

		if (!res.ok) {
			await interaction.reply({ content: res.error, flags: 'Ephemeral' });
			return;
		}
		await interaction.reply({ content: res.data, flags: 'Ephemeral' });
	},
} satisfies Command;
