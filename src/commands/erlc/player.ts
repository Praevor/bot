import { APIEmbed, ApplicationCommandOptionType, AttachmentBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../index.js';
import { getServerKey } from '../../util/getServerKey.js';
import { callERLCapi } from '../../util/callERLCapi.js';
import { Player } from '../../types/Player.js';
import { locToMap } from '../../util/locToMap.js';
import { Vehicle } from '../../types/Vehicle.js';

export default {
	data: {
		name: 'erlc-player',
		description: 'Get an ERLC player',
		options: [
			{
				name: 'username',
				description: 'The username of the player you want to get',
				type: ApplicationCommandOptionType.String,
				required: true,
			},
		],
	},
	async execute(interaction) {
		await interaction.deferReply();
		const username = (interaction as ChatInputCommandInteraction).options.getString('username', true);

		if (!interaction.guildId) {
			await interaction.editReply({ content: 'This can be only ran in a server' });
			return;
		}

		const key = await getServerKey(interaction.guildId);

		if (!key.ok) {
			await interaction.editReply({ content: key.error });
			return;
		}

		const params = new URLSearchParams();
		params.append('Players', 'true');
		params.append('Vehicles', 'true');

		const res = await callERLCapi('/v2/server', key.data, 'GET', undefined, params);
		if (!res.ok) {
			await interaction.editReply({ content: res.error });
			return;
		}

		const players = (res.data.body as any).Players as Player[];
		const vehicles = (res.data.body as any).Vehicles as Vehicle[];

		const player = players.find((p) => p.Player.split(':')[0] === username);
		if (!player) {
			await interaction.editReply({ content: 'Player not found in game' });
			return;
		}

		await interaction.editReply('Making map... \n-# This might take a few seconds');

		const locMap = await locToMap(player.Location.LocationX, player.Location.LocationZ);

		const file = new AttachmentBuilder(locMap, { name: 'loc.png' });

		const [name, id] = player.Player.split(':');
		const vehicle = vehicles.find((v) => v.Owner === name);

		const embed: APIEmbed = {
			title: name,
			description: [
				`**[Roblox Profile](https://roblox.com/users/${id})**`,
				'**Team**',
				`${player.Team} ${player.Callsign ? `(${player.Callsign})` : ''}`,
				'**Permissions**',
				player.Permissions,
				'**Wanted stars**',
				player.WantedStars,
				'**Vehicle**',
				`${vehicle ? `Name: ${vehicle.Name} \nPlate: ${vehicle.Plate} \nColor: ${vehicle.ColorName} \nTexture: ${vehicle.Texture ?? 'N/A'}` : 'N/A'}`,
			].join('\n'),
		};

		await interaction.editReply({ embeds: [embed], files: [file] });
	},
} satisfies Command;
