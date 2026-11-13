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
			const push = async () => {
				if (process.env.DEBUG === 'true') console.log('Sending push');
				try {
					const res = await fetch(pushUrl);
					if (!res.ok) console.error(`Error while sending request to push url: ${res.status}`);
				} catch (error) {
					console.error('Error while sending request to push url:', error);
				}
				if (process.env.DEBUG === 'true') console.log('Push sent');
			};

			void push();
			setInterval(() => void push(), Number(interval));
		}
	},
} satisfies Event<Events.ClientReady>;
