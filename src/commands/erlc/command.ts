import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../index.js';
import { getRank } from '../../util/getRank.js';
import { getServerKey } from '../../util/getServerKey.js';
import { callERLCapi } from '../../util/callERLCapi.js';
import { sendLog } from '../../util/sendLog.js';

export default {
	data: {
		name: 'erlc-command',
		description: 'Run a command in game',
		options: [
			{
				name: 'command',
				description: 'The full command you want to run. (Example: :h hello world)',
				type: ApplicationCommandOptionType.String,
				required: true,
			},
		],
	},
	async execute(interaction) {
		const command = (interaction as ChatInputCommandInteraction).options.getString('command', true);

		await interaction.deferReply({ flags: 'Ephemeral' });

		if (!interaction.guildId) {
			await interaction.editReply('You can only use this in a guild');
			return;
		}

		const rank = await getRank(interaction);
		if (!rank.ok) {
			await interaction.editReply(rank.error);
			return;
		}
		if (rank.data !== 'MANAGER' && rank.data !== 'ADMIN') {
			await interaction.editReply("You don't have permissions for this");
			return;
		}

		const key = await getServerKey(interaction.guildId);
		if (!key.ok) {
			await interaction.editReply(key.error);
			return;
		}

		const res = await callERLCapi('/v2/server/command', key.data, 'POST', { command: command });
		if (!res.ok) {
			await interaction.editReply(res.error);
			return;
		}

		await sendLog(
			'Command ran',
			`Command: ${command} \nRan by: <@${interaction.member?.user.id}>`,
			interaction.guildId,
		);
		await interaction.editReply('Ran command!');
	},
} satisfies Command;
