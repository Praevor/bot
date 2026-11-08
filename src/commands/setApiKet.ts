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
		await interaction.deferReply({ flags: 'Ephemeral' });
		const apiKey = (interaction as ChatInputCommandInteraction).options.getString('key', true);

		if (!interaction.guildId) {
			await interaction.editReply({ content: 'This can be only used in servers' });
			return;
		}

		const rank = await getRank(interaction);
		if (!rank.ok) {
			await interaction.editReply({ content: rank.error });
			return;
		}
		if (rank.data !== 'ADMIN') {
			await interaction.editReply({ content: "You don't have perms to use this" });
			return;
		}

		const res = await addKeyToDb(apiKey, interaction.guildId);

		if (!res.ok) {
			await interaction.editReply({ content: res.error });
			return;
		}
		await sendLog('Set API key', `The API key has been set by <@${interaction.member?.user.id}>`, interaction.guildId);
		await interaction.editReply({ content: res.data });
	},
} satisfies Command;
