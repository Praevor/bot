import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../index.js';
import { newLog } from '../../util/newLog.js';
import { getRank } from '../../util/getRank.js';

export default {
	data: {
		name: 'moderate',
		description: 'Log a moderation',
		options: [
			{
				name: 'roblox_username',
				description: 'The Roblox username of the user you want to punish',
				type: ApplicationCommandOptionType.String,
				required: true,
			},
			{
				name: 'reason',
				description: 'The reason for the punishment',
				type: ApplicationCommandOptionType.String,
				required: true,
			},
			{
				name: 'punisment',
				description: 'The punishment type',
				type: ApplicationCommandOptionType.String,
				required: true,
				choices: [
					{
						name: 'Warning',
						value: 'WARNING',
					},
					{
						name: 'Kick',
						value: 'KICK',
					},
					{
						name: 'Ban',
						value: 'BAN',
					},
				],
			},
		],
	},
	async execute(interaction) {
		await interaction.deferReply({ flags: 'Ephemeral' });

		if (!interaction.guildId) {
			await interaction.editReply('You can only use this in a server');
			return;
		}

		const robloxUsername = (interaction as ChatInputCommandInteraction).options.getString('roblox_username', true);
		const reason = (interaction as ChatInputCommandInteraction).options.getString('reason', true);
		const type = (interaction as ChatInputCommandInteraction).options.getString('punishment', true) as
			'WARNING' | 'KICK' | 'BAN';

		const rank = await getRank(interaction);
		if (!rank.ok) {
			await interaction.editReply(rank.error);
			return;
		}

		const res = await newLog(
			interaction.guildId,
			interaction.member?.user.id ?? 'a',
			robloxUsername,
			type,
			rank.data,
			reason,
		);
		if (!res.ok) {
			await interaction.editReply(res.error);
			return;
		}

		await interaction.editReply(res.data);
	},
} satisfies Command;
