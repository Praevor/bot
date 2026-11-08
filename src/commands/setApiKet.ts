import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import { Command } from './index.js';
import { addKeyToDb } from '../util/addKeyToDb.js';
import { getRank } from '../util/getRank.js';
import { sendLog } from '../util/sendLog.js';

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

		const rank = await getRank(interaction);
		if (!rank.ok) {
			await interaction.reply({ content: rank.error, flags: 'Ephemeral' });
			return;
		}
		if (rank.data !== 'ADMIN') {
			await interaction.reply({ content: "You don't have perms to use this", flags: 'Ephemeral' });
			return;
		}

		const res = await addKeyToDb(apiKey, interaction.guildId);

		if (!res.ok) {
			await interaction.reply({ content: res.error, flags: 'Ephemeral' });
			return;
		}
		await sendLog('Set API key', `The API key has been set by <@${interaction.member?.user.id}>`, interaction.guildId);
		await interaction.reply({ content: res.data, flags: 'Ephemeral' });
	},
} satisfies Command;
