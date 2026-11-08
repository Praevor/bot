import { APIEmbed } from 'discord.js';
import { callERLCapi } from '../../util/callERLCapi.js';
import { getServerKey } from '../../util/getServerKey.js';
import { Command } from '../index.js';
import { Player } from '../../types/Player.js';

export default {
	data: {
		name: 'erlc-players',
		description: 'Get all ERLC players',
	},
	async execute(interaction) {
		await interaction.deferReply();
		if (!interaction.guildId) {
			await interaction.reply({ content: 'You can only use this in a server' });
			return;
		}

		const apiKey = await getServerKey(interaction.guildId);

		if (!apiKey.ok) {
			await interaction.editReply({ content: apiKey.error });
			return;
		}

		const params = new URLSearchParams();
		params.append('Players', 'true');

		const res = await callERLCapi('/v2/server', apiKey.data, 'GET', undefined, params);

		if (!res.ok) {
			await interaction.editReply({ content: res.error });
			return;
		}

		const players = (res.data.body as any).Players as Player[];

		const embed: APIEmbed = {
			title: 'ERLC Players',
			description: players
				.map(
					(p) =>
						`**${p.Player.split(':')[0]}** \n[Roblox profile](https://roblox.com/users/${p.Player.split(':')[1]}) \n${p.Team} ${p.Callsign ? `(${p.Callsign})` : ''} \nWanted Stars ${p.WantedStars}`,
				)
				.join('\n'),
		};

		await interaction.editReply({ embeds: [embed] });
	},
} satisfies Command;
