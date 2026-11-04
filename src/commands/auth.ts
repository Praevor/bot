import { PermissionFlagsBits } from 'discord.js';
import { Command } from './index.js';
import { getServerKey } from '../util/getServerKey.js';

export default {
	data: {
		name: 'auth',
		description: 'Authorize Preavor so it can run commands',
	},
	async execute(interaction) {
		await interaction.deferReply({ flags: 'Ephemeral' });

		if (!interaction.guildId) {
			await interaction.editReply('You can only use this in a server');
			return;
		}
		if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
			await interaction.editReply('You must be an admin to use this');
			return;
		}

		const key = await getServerKey(interaction.guildId);
		if (!key.ok) {
			await interaction.editReply(key.error);
			return;
		}

		const internalId = key.data.split('-')[1] as string;
		const appId = process.env.APP_ID;
		if (!appId) throw new Error('Missing APP_ID in env');

		const authLink = `https://api.erlc.gg/server-owners/server/${internalId}/authorize/${appId}`;

		await interaction.editReply({
			embeds: [
				{
					title: 'Authorize Preavor',
					fields: [
						{
							name: 'Link',
							value: authLink,
							inline: true,
						},
						{
							name: 'Reason',
							value:
								'If you want Preavor to be able to use in game commands then the owner of the ERLC server will have to authorize it. You can see the official docs [here](https://apidocs.erlc.gg/creating-authorization-links).',
							inline: true,
						},
					],
				},
			],
		});
	},
} satisfies Command;
