import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../index.js';
import { db } from '../../db/index.js';
import { moderationsTable } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { sendLog } from '../../util/sendLog.js';
import { getRank } from '../../util/getRank.js';
import { randomFill } from 'crypto';

export default {
	data: {
		name: 'delete-moderation',
		description: 'Deletes a moderation by the id',
		options: [
			{
				name: 'id',
				description: 'The id of the moderation',
				type: ApplicationCommandOptionType.Number,
				required: true,
			},
		],
	},
	async execute(interaction) {
		const moderationId = (interaction as ChatInputCommandInteraction).options.getNumber('id', true);

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
		if (rank.data !== 'ADMIN' && rank.data !== 'MANAGER') {
			await interaction.editReply("You don't have permissions to use this");
			return;
		}

		const [moderation] = await db.select().from(moderationsTable).where(eq(moderationsTable.id, moderationId)).limit(1);

		if (!moderation || moderation.serverId !== interaction.guildId) {
			await interaction.editReply('Moderation not found');
			return;
		}

		await db.delete(moderationsTable).where(eq(moderationsTable.id, moderationId));

		await sendLog(
			'Moderation deleted',
			`Roblox: [${moderation.robloxUsername}](https://roblox.com/users/${moderation.robloxId}) \nType: ${moderation.punishmentType.toLowerCase()} \nReason: ${moderation.reason} \nModerator: <@${moderation.moderatorId}> \nDeleted by: <@${interaction.member?.user.id}>`,
			interaction.guildId,
		);
		await interaction.editReply('Moderation deleted');
	},
} satisfies Command;
