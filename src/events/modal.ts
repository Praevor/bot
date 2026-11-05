import { Events } from 'discord.js';
import type { Event } from './index.js';
import { db } from '../db/index.js';
import { serversTable } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { sendLog } from '../util/sendLog.js';

export default {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (interaction.isModalSubmit()) {
			const modalId = interaction.customId;

			switch (modalId) {
				case 'setupModal':
					if (!interaction.guildId) {
						await interaction.reply({ content: 'This can be only used in servers', flags: 'Ephemeral' });
						return;
					}

					const role = interaction.fields.getSelectedRoles('managerRole')?.first();
					const modRole = interaction.fields.getSelectedRoles('moderatorRole')?.first();
					const logChannel = interaction.fields.getSelectedChannels('logChannel')?.first();

					if (!role || !modRole || !logChannel) {
						await interaction.reply({ content: 'No role(s) given', flags: 'Ephemeral' });
						return;
					}

					const [server] = await db
						.select()
						.from(serversTable)
						.where(eq(serversTable.id, interaction.guildId))
						.limit(1);

					if (!server) {
						await db.insert(serversTable).values({
							id: interaction.guildId,
							managerRoleId: role.id,
							moderatorRoleId: modRole.id,
							logChannelId: logChannel.id,
						});

						await sendLog(
							'Setup',
							'The server has been set up! Set the ERLC API key with /set-api-key and authorize Praevor with /auth.',
							interaction.guildId,
						);
						await interaction.reply({ content: 'Set up server!', flags: 'Ephemeral' });
						return;
					}

					await db
						.update(serversTable)
						.set({ managerRoleId: role.id, moderatorRoleId: modRole.id, logChannelId: logChannel.id })
						.where(eq(serversTable.id, server.id));

					await sendLog(
						'Settings updated',
						`Manager role: <@&${role.id}> \nModerator role: <@&${modRole.id}> \nLog channel <#${logChannel.id}> \nUpdated by: <@${interaction.member?.user.id}>`,
						interaction.guildId,
					);
					await interaction.reply({ content: 'Updated server!', flags: 'Ephemeral' });
			}
		}
	},
} satisfies Event<Events.InteractionCreate>;
