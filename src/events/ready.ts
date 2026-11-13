import { Events } from 'discord.js';
import type { Event } from './index.js';

export default {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

		const pushUrl = process.env.PUSH_URL;
		const interval = process.env.PUSH_INTERVAL;

		if (pushUrl && interval) {
			setInterval(async () => {
				const res = await fetch(pushUrl);
				if (!res.ok) throw new Error(`Error while seing request to push url: ${res.status}`);
			}, Number(interval));
		}
	},
} satisfies Event<Events.ClientReady>;
