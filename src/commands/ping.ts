import type { Command } from './index.js';

export default {
	data: {
		name: 'ping',
		description: 'Ping!',
	},
	async execute(interaction) {
		const res = await interaction.reply({ content: 'Loading...', withResponse: true });
		const message = res.resource?.message;
		if (!message) return;

		const diff = message.createdTimestamp - interaction.createdTimestamp;

		await interaction.editReply(`Round trip: ${String(diff)}ms`);
	},
} satisfies Command;
