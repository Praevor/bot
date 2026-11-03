import { Events } from 'discord.js';
import type { Event } from './index.js';
import { db } from '../db/index.js';
import { serversTable } from '../db/schema.js';
import { eq } from 'drizzle-orm';

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

					if (!role || !modRole) {
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
						});

						await interaction.reply({ content: 'Set up server!', flags: 'Ephemeral' });
						return;
					}

					await db
						.update(serversTable)
						.set({ managerRoleId: role.id, moderatorRoleId: modRole.id })
						.where(eq(serversTable.id, server.id));

					await interaction.reply({ content: 'Updated server!', flags: 'Ephemeral' });
			}
		}
	},
} satisfies Event<Events.InteractionCreate>;
