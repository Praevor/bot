import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../index.js';
import { getRank } from '../../util/getRank.js';
import { teleportPlayer } from '../../util/teleportPlayer.js';
import { getServerKey } from '../../util/getServerKey.js';
import { callERLCapi } from '../../util/callERLCapi.js';
import { Player } from '../../types/Player.js';

export default {
	data: {
		name: 'teleport',
		description: 'Teleport a player to a specific location',
		options: [
			{
				name: 'username',
				description: 'The full username of the player you want to teleport',
				required: true,
				type: ApplicationCommandOptionType.String,
			},
			{
				name: 'x',
				description: 'The X location of the target location',
				required: true,
				type: ApplicationCommandOptionType.String,
			},
			{
				name: 'z',
				description: 'The z location of the target location',
				required: true,
				type: ApplicationCommandOptionType.String,
			},
		],
	},
	async execute(interaction) {
		await interaction.deferReply();
		if (!interaction.guildId) {
			await interaction.editReply('You can only use this in a server');
			return;
		}

		const rank = await getRank(interaction);
		if (!rank.ok) {
			await interaction.editReply(rank.error);
			return;
		}

		if (rank.data !== 'MANAGER' && rank.data !== 'ADMIN') {
			await interaction.editReply("You don't have permissions to run this");
			return;
		}

		const i = interaction as ChatInputCommandInteraction;
		const username = i.options.getString('username', true);
		const x = i.options.getString('x', true);
		const z = i.options.getString('z', true);

		const apiKey = await getServerKey(interaction.guildId);
		if (!apiKey.ok) {
			await interaction.editReply(apiKey.error);
			return;
		}

		const params = new URLSearchParams();
		params.append('Players', 'true');

		const playersRes = await callERLCapi('/v2/server', apiKey.data, 'GET', undefined, params);

		if (!playersRes.ok) {
			await interaction.editReply({ content: playersRes.error });
			return;
		}

		const players = (playersRes.data.body as any).Players as Player[];
		const player = players.filter((p) => p.Player.split(':')[0] === username)[0];

		if (!player) {
			await interaction.editReply('Player not found');
			return;
		}

		const res = await teleportPlayer(interaction.guildId, username, player.Player.split(':')[1], { X: x, Z: z });
		if (!res.ok) {
			await interaction.editReply(res.error);
			return;
		}

		await interaction.editReply('Teleported!');
	},
} satisfies Command;
