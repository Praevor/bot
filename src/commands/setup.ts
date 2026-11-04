import { LabelBuilder, ModalBuilder, PermissionFlagsBits, RoleSelectMenuBuilder } from 'discord.js';
import { Command } from './index.js';
import { getRank } from '../util/getRank.js';

export default {
	data: {
		name: 'setup',
		description: 'Set up or edit the server',
	},
	async execute(interaction) {
		const rank = await getRank(interaction);
		if (!rank.ok) {
			await interaction.reply({ content: rank.error, flags: 'Ephemeral' });
			return;
		}
		if (rank.data !== 'ADMIN') {
			await interaction.reply({ content: "You don't have permissions for this", flags: 'Ephemeral' });
			return;
		}

		const modal = new ModalBuilder().setCustomId('setupModal').setTitle('Setup');

		const managerRoleInput = new RoleSelectMenuBuilder()
			.setCustomId('managerRole')
			.setPlaceholder('Select the manager role')
			.setMinValues(1)
			.setMaxValues(1);

		const roleLabel = new LabelBuilder()
			.setLabel('Manager role')
			.setDescription("The role that can change the server's settings")
			.setRoleSelectMenuComponent(managerRoleInput);

		const moderatorRoleInput = new RoleSelectMenuBuilder()
			.setCustomId('moderatorRole')
			.setPlaceholder('Select the moderator role')
			.setMinValues(1)
			.setMaxValues(1);

		const moderatorRoleLabel = new LabelBuilder()
			.setLabel('Moderator role')
			.setDescription('The role that can make logs')
			.setRoleSelectMenuComponent(moderatorRoleInput);

		modal.addLabelComponents(roleLabel, moderatorRoleLabel);

		await interaction.showModal(modal);
	},
} satisfies Command;
