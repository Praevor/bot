import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import { Command } from './index.js';
import { getRank } from '../util/getRank.js';
import { db } from '../db/index.js';
import { serversTable } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { sendLog } from '../util/sendLog.js';

export default {
	data: {
		name: 'delete',
		description: 'Deletes all information about this server in our databases',
		options: [
			{
				name: 'text',
				description: 'The text the command says to write here to confirm the deletion',
				type: ApplicationCommandOptionType.String,
				required: false,
			},
		],
	},
	async execute(interaction) {
		await interaction.deferReply({ flags: 'Ephemeral' });
		const rank = await getRank(interaction);
		if (!rank.ok) {
			await interaction.editReply(rank.error);
			return;
		}
		if (rank.data !== 'ADMIN') {
			await interaction.editReply('Only admins can use this command');
			return;
		}

		const text = (interaction as ChatInputCommandInteraction).options.getString('text', false);

		if (!text || text !== 'DELETE') {
			await interaction.editReply({
				embeds: [
					{
						title: 'Deletion',
						description:
							'Run this command with the text option containing DELETE. **This will delete all information about this server in our databases.**',
					},
				],
			});
			return;
		}

		await sendLog(
			'Server reset',
			`The server has been deleted from Praevor's databse by <@${interaction.member?.user.id}>`,
			interaction.guildId!,
		);

		const [server] = await db
			.select()
			.from(serversTable)
			.where(eq(serversTable.id, interaction.guildId ?? 'a'))
			.limit(1);

		if (!server) {
			await interaction.editReply('Server not found in DB');
			return;
		}

		await interaction.editReply('Deleting server...');

		await db.delete(serversTable).where(eq(serversTable.id, interaction.guildId ?? 'a'));

		await interaction.editReply('Server deleted');
	},
} satisfies Command;
