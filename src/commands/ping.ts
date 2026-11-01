import type { Command } from './index.js';

export default {
	data: {
		name: 'ping',
		description: 'Ping!',
	},
	async execute(interaction) {
		const res = await interaction.reply("Loading...");
		const diff = res.createdTimestamp - interaction.createdTimestamp;
		
		await res.edit(`Round trip: ${String(diff)}`);
	},
} satisfies Command;
