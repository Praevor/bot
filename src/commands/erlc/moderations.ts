import { APIEmbed, ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../index.js';
import { getRank } from '../../util/getRank.js';
import { getModerations } from '../../util/getModeraions.js';

export default {
	data: {
		name: 'moderations',
		description: 'Check the moderaions of a Roblox user',
		options: [
			{
				name: 'username',
				description: 'The Roblox username',
				type: ApplicationCommandOptionType.String,
				required: true,
			},
		],
	},
	async execute(interaction) {
		const username = (interaction as ChatInputCommandInteraction).options.getString('username', true);

		await interaction.deferReply({ flags: 'Ephemeral' });

		if (!interaction.guildId) {
			await interaction.editReply('You can only use this in a server');
			return;
		}

		const rank = await getRank(interaction);
		if (!rank.ok) {
			await interaction.editReply(rank.error);
			return;
		}

		if (rank.data === 'USER') {
			await interaction.editReply("You don't have permissions to use this");
			return;
		}

		const moderations = await getModerations(username, interaction.guildId);

		if (moderations.length === 0) {
			await interaction.editReply('No moderations found');
			return;
		}

		const embed: APIEmbed = {
			title: `${username}'s moderations`,
			description: moderations
				.map(
					(m) =>
						`**#${m.id} ${m.punishmentType.toLowerCase()}** \nReason: ${m.reason} \nModerator: <@${m.moderatorId}>`,
				)
				.join('\n'),
		};

		await interaction.editReply({ embeds: [embed] });
	},
} satisfies Command;
