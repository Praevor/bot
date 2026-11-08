import { APIEmbed } from 'discord.js';
import { callERLCapi } from '../../util/callERLCapi.js';
import { getServerKey } from '../../util/getServerKey.js';
import { Command } from '../index.js';

export default {
	data: {
		name: 'erlc-info',
		description: 'Get in game info',
	},
	async execute(interaction) {
		await interaction.deferReply();
		if (!interaction.guildId) {
			await interaction.reply({ content: 'You can only use this in a server', flags: 'Ephemeral' });
			return;
		}

		const key = await getServerKey(interaction.guildId);

		if (!key.ok) {
			await interaction.editReply({ content: key.error });
			return;
		}

		const neededThings = ['Queue'];
		const params = new URLSearchParams();
		params.append('Player', 'true');
		neededThings.forEach((n) => params.append(n, 'true'));

		const res = await callERLCapi('/v2/server', key.data, 'GET', undefined, params);

		if (!res.ok) {
			await interaction.editReply({ content: res.error });
			return;
		}

		const server = res.data.body;

		const embed: APIEmbed = {
			title: server.Name,
			fields: [
				{
					name: 'Players',
					value: `${server.CurrentPlayers}/${server.MaxPlayers}`,
					inline: true,
				},
				{
					name: 'Join Code',
					value: server.JoinKey,
					inline: true,
				},
				{
					name: 'Queue',
					value: String(server.Queue?.length),
					inline: true,
				},
			],
			footer: { text: 'ERLC server status' },
		};

		await interaction.editReply({ embeds: [embed] });
	},
} satisfies Command;
